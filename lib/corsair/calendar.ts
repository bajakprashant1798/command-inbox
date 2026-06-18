import { getCorsairTenant } from "./client";

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  location: string;
  status: string;
  organizerEmail?: string;
  isAllDay: boolean;
}

export async function getUpcomingEvents(tenantId: string): Promise<CalendarEvent[]> {
  const tenant = getCorsairTenant(tenantId);

  try {
    const response = await tenant.googlecalendar.api.events.getMany({
      calendarId: "primary",
      maxResults: 15,
      singleEvents: true, // Expand recurring events into individual occurrences
      orderBy: "startTime", // Sort by start time ascending
      timeMin: new Date().toISOString(),
    });

    const items = response.items || [];

    return items.map((item: any) => {
      const startObj = item.start || {};
      const endObj = item.end || {};

      const start = startObj.dateTime || startObj.date || "";
      const end = endObj.dateTime || endObj.date || "";
      const isAllDay = !!startObj.date;

      return {
        id: item.id || "",
        summary: item.summary || "(No Title)",
        description: item.description || "",
        start,
        end,
        location: item.location || "",
        status: item.status || "",
        organizerEmail: item.organizer?.email,
        isAllDay,
      };
    });
  } catch (err) {
    console.error("Error in getUpcomingEvents service wrapper:", err);
    throw err;
  }
}
