import { NextRequest, NextResponse } from "next/server";
import { parseCommandWithGemini, CommandAction, getGeminiClient } from "@/lib/ai/gemini";
import { getCorsairTenant } from "@/lib/corsair/client";

import { auth } from "@/lib/auth";

// Helper to check if two time ranges overlap
function isOverlapping(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

// Conflict checking and alternative slot finding helper
async function checkConflictsAndSuggest(
  tenantId: string,
  eventAction: { startTime: string; endTime: string }
) {
  const tenant = getCorsairTenant(tenantId);
  const proposedStart = new Date(eventAction.startTime);
  const proposedEnd = new Date(eventAction.endTime);
  const durationMs = proposedEnd.getTime() - proposedStart.getTime();

  try {
    // 1. Check direct conflict for the proposed slot
    const checkResponse = await tenant.googlecalendar.api.calendar.getAvailability({
      timeMin: eventAction.startTime,
      timeMax: eventAction.endTime,
      items: [{ id: "primary" }],
    });

    const primaryCal = checkResponse.calendars?.primary || {};
    const directBusy = primaryCal.busy || [];
    
    // If there are no busy intervals overlapping the proposed slot, we have no conflict!
    if (directBusy.length === 0) {
      return { conflict: false };
    }

    // 2. Conflict detected! Let's find an alternative free slot.
    console.log("Conflict detected. Searching for alternative slot...");
    
    // We will scan a window of the same day (9 AM to 6 PM)
    let searchStart = new Date(proposedStart);
    searchStart.setHours(9, 0, 0, 0);
    
    // If the search start is in the past (e.g. today after 9 AM), start from now (rounded to next 30m)
    const now = new Date();
    if (searchStart < now) {
      searchStart = new Date(now);
      const minutes = searchStart.getMinutes();
      searchStart.setMinutes(minutes >= 30 ? 60 : 30, 0, 0); // round to next half hour
    }

    let searchEnd = new Date(proposedStart);
    searchEnd.setHours(18, 0, 0, 0);

    // If search window is too small, check next day business hours
    if (searchEnd.getTime() - searchStart.getTime() < durationMs) {
      searchStart = new Date(proposedStart);
      searchStart.setDate(searchStart.getDate() + 1);
      searchStart.setHours(9, 0, 0, 0);
      
      searchEnd = new Date(searchStart);
      searchEnd.setHours(18, 0, 0, 0);
    }

    // Query availability for the entire search window
    const searchResponse = await tenant.googlecalendar.api.calendar.getAvailability({
      timeMin: searchStart.toISOString(),
      timeMax: searchEnd.toISOString(),
      items: [{ id: "primary" }],
    });

    const busyIntervals = (searchResponse.calendars?.primary?.busy || []).map((b: any) => ({
      start: new Date(b.start),
      end: new Date(b.end),
    }));

    // Find the first free slot in 30-minute increments
    let currentStart = new Date(searchStart);
    let suggestedSlot: { startTime: string; endTime: string } | undefined = undefined;

    // Scan up to 2 days ahead if needed
    for (let day = 0; day < 2; day++) {
      if (day > 0) {
        currentStart = new Date(proposedStart);
        currentStart.setDate(currentStart.getDate() + day);
        currentStart.setHours(9, 0, 0, 0);
        
        searchEnd = new Date(currentStart);
        searchEnd.setHours(18, 0, 0, 0);

        // Fetch availability for the next day
        const nextDayResponse = await tenant.googlecalendar.api.calendar.getAvailability({
          timeMin: currentStart.toISOString(),
          timeMax: searchEnd.toISOString(),
          items: [{ id: "primary" }],
        });
        busyIntervals.length = 0;
        busyIntervals.push(...(nextDayResponse.calendars?.primary?.busy || []).map((b: any) => ({
          start: new Date(b.start),
          end: new Date(b.end),
        })));
      }

      while (currentStart.getTime() + durationMs <= searchEnd.getTime()) {
        const currentEnd = new Date(currentStart.getTime() + durationMs);
        
        const hasOverlap = busyIntervals.some((busy: any) =>
          isOverlapping(currentStart, currentEnd, busy.start, busy.end)
        );

        if (!hasOverlap) {
          suggestedSlot = {
            startTime: currentStart.toISOString(),
            endTime: currentEnd.toISOString(),
          };
          break;
        }

        // Move currentStart forward by 30 mins
        currentStart.setMinutes(currentStart.getMinutes() + 30);
      }

      if (suggestedSlot) break;
    }

    return {
      conflict: true,
      conflictDetails: {
        originalSlot: {
          startTime: eventAction.startTime,
          endTime: eventAction.endTime,
        },
        suggestedSlot,
        message: "This slot conflicts with an existing event on your calendar.",
      },
    };
  } catch (err: any) {
    console.error("Warning: Availability check failed:", err);
    // If the calendar sync/auth is not fully complete, fail gracefully
    return {
      conflict: false,
      warning: "Calendar availability check is currently unavailable: " + (err.message || String(err)),
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tenantId = session.user.email;

    // Check key presence first as requested
    try {
      getGeminiClient();
    } catch (keyErr: any) {
      return NextResponse.json(
        { error: keyErr.message },
        { status: 400 }
      );
    }

    const { command } = await req.json();
    
    if (!command || typeof command !== "string") {
      return NextResponse.json(
        { error: "Command string is required" },
        { status: 400 }
      );
    }

    // 1. Parse natural language command with Gemini
    const action = await parseCommandWithGemini(command);

    // 2. Identify calendar actions and check availability
    let conflictInfo: any = null;
    if (action.type === "SCHEDULE_EVENT") {
      conflictInfo = await checkConflictsAndSuggest(tenantId, action);
    } else if (action.type === "COMPOSED") {
      const scheduleAction = action.actions.find((a: any) => a.type === "SCHEDULE_EVENT") as any;
      if (scheduleAction) {
        conflictInfo = await checkConflictsAndSuggest(tenantId, scheduleAction);
      }
    }

    return NextResponse.json({
      command,
      action,
      ...(conflictInfo || {}),
    });
  } catch (err: any) {
    console.error("API Command processing error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process command" },
      { status: 500 }
    );
  }
}
