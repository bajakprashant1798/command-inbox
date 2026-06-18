import { getUpcomingEvents } from "@/lib/corsair/calendar";
import { EventList } from "@/components/calendar/event-list";
import { AlertTriangle } from "lucide-react";

import { requireAuth } from "@/lib/auth/session";
import { getCorsairConnectionStatus } from "@/lib/auth/connection";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Calendar | MailCmd Inbox",
  description: "Manage your Google Calendar schedule and events",
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await requireAuth();
  const status = await getCorsairConnectionStatus(user.email!);
  
  if (!status.connected) {
    redirect("/onboarding");
  }

  try {
    const events = await getUpcomingEvents(user.email!);

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950 lg:pl-64">
        <EventList initialEvents={events} />
      </div>
    );
  } catch (err: any) {
    console.error("Failed to load calendar events:", err);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-zinc-950 text-zinc-100">
        <div className="max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-xl space-y-6 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Connection Error</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Could not fetch your schedule from Google Calendar. Please verify that your Google Calendar integration credentials and OAuth settings are fully complete.
            </p>
          </div>
          <div className="bg-zinc-950 p-4 rounded-lg text-left text-xs font-mono text-zinc-500 border border-zinc-800 break-all">
            {err.message || String(err)}
          </div>
        </div>
      </div>
    );
  }
}
