import { NextResponse } from "next/server";
import { getUpcomingEvents } from "@/lib/corsair/calendar";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const events = await getUpcomingEvents(session.user.email);
    return NextResponse.json({ events });
  } catch (err: any) {
    console.error("Failed to refresh calendar events:", err);
    return NextResponse.json(
      { error: err.message || "Failed to refresh events" },
      { status: 500 }
    );
  }
}
