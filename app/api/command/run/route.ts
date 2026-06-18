import { NextRequest, NextResponse } from "next/server";
import { getCorsairTenant } from "@/lib/corsair/client";
import { CommandAction } from "@/lib/ai/action-types";

// Helper to construct a base64url encoded RFC 2822 message
function makeRawEmail(to: string, subject: string, body: string): string {
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    body
  ];
  const emailContent = emailLines.join('\r\n');
  return Buffer.from(emailContent)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tenantId = session.user.email;
    const { action } = await req.json();
    
    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const tenant = getCorsairTenant(tenantId);
    const results: any[] = [];
    const actionsToRun = action.type === "COMPOSED" ? action.actions : [action];

    for (const act of actionsToRun) {
      if (act.type === "SCHEDULE_EVENT") {
        console.log(`Scheduling event: ${act.title}`);
        const eventRes = await tenant.googlecalendar.api.events.create({
          calendarId: "primary",
          event: {
            summary: act.title,
            description: act.description,
            start: { dateTime: act.startTime },
            end: { dateTime: act.endTime },
            attendees: act.attendees?.map((email: string) => ({ email })),
          },
        });
        results.push({
          type: "SCHEDULE_EVENT",
          status: "success",
          data: eventRes,
        });
      } else if (act.type === "SEND_EMAIL") {
        console.log(`Sending email to: ${act.to}`);
        const rawEmail = makeRawEmail(act.to, act.subject, act.body);
        const emailRes = await tenant.gmail.api.messages.send({
          raw: rawEmail,
        });
        results.push({
          type: "SEND_EMAIL",
          status: "success",
          data: emailRes,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (err: any) {
    console.error("Failed to execute action:", err);
    return NextResponse.json(
      { error: err.message || "Failed to execute actions" },
      { status: 500 }
    );
  }
}
