"use client";

import { useState } from "react";
import { CalendarEvent } from "@/lib/corsair/calendar";
import { Clock, MapPin, User, CalendarDays, RefreshCw } from "lucide-react";

interface EventListProps {
  initialEvents: CalendarEvent[];
}

export function EventList({ initialEvents }: EventListProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper to format start and end times cleanly (e.g., "10:00 AM - 11:30 AM")
  function formatTimeRange(startStr: string, endStr: string, isAllDay: boolean) {
    if (!startStr) return "";
    if (isAllDay) return "All Day";

    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : null;

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const formattedStart = start.toLocaleTimeString("en-US", timeOptions);
    if (!end) return formattedStart;

    const formattedEnd = end.toLocaleTimeString("en-US", timeOptions);
    return `${formattedStart} - ${formattedEnd}`;
  }

  // Helper to group events by start date
  function groupEventsByDate(eventsList: CalendarEvent[]) {
    const groups: { [key: string]: CalendarEvent[] } = {};

    eventsList.forEach((event) => {
      if (!event.start) return;
      const dateKey = new Date(event.start).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return groups;
  }

  // Label relative days like "Today" or "Tomorrow"
  function getRelativeDateLabel(dateStr: string) {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const checkDate = new Date(dateStr);

    if (checkDate.toDateString() === today.toDateString()) {
      return `Today — ${checkDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (checkDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow — ${checkDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }

    return checkDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/calendar/refresh");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to refresh calendar events", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const grouped = groupEventsByDate(events);
  const dateKeys = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-950 flex-shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Schedule
          </h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">
            {events.length} upcoming events found
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all border border-zinc-800 disabled:opacity-50 text-xs font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Sync Calendar
        </button>
      </header>

      {/* Main Schedule Pane */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 max-w-4xl w-full mx-auto">
        {events.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center h-64 border border-dashed border-zinc-900 rounded-2xl bg-zinc-900/10">
            <CalendarDays className="w-10 h-10 text-zinc-700 mb-3" />
            <h3 className="font-semibold text-zinc-300">No upcoming events</h3>
            <p className="text-sm text-zinc-500 mt-1">Your schedule is completely clear.</p>
          </div>
        ) : (
          dateKeys.map((dateKey) => (
            <section key={dateKey} className="space-y-4 relative">
              <h3 className="text-xs font-semibold tracking-wider text-indigo-400 font-mono sticky top-0 bg-zinc-950 py-3 z-10 border-b border-zinc-900/60 shadow-[0_4px_12px_-4px_rgba(10,10,10,0.8)]">
                {getRelativeDateLabel(dateKey).toUpperCase()}
              </h3>
              
              <div className="space-y-3 pt-1">
                {grouped[dateKey].map((event) => {
                  const isCancelled = event.status === "cancelled";
                  return (
                    <div
                      key={event.id}
                      className={`p-5 rounded-xl border transition-all hover:bg-zinc-900/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isCancelled
                          ? "bg-zinc-900/20 border-red-950/40 opacity-60"
                          : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800 border-l-4 border-l-indigo-600"
                      }`}
                    >
                      {/* Event details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-semibold text-base text-zinc-100 group-hover:text-white">
                            {event.summary}
                          </h4>
                          {isCancelled && (
                            <span className="text-[9px] bg-red-950/40 border border-red-900/30 text-red-400 px-2 py-0.5 rounded font-mono uppercase">
                              Cancelled
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                            {event.description}
                          </p>
                        )}
                      </div>

                      {/* Time slot & Info */}
                      <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs text-zinc-400 md:text-right flex-shrink-0 font-mono">
                        <div className="flex items-center gap-1.5 text-zinc-200 font-semibold bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800/80">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {formatTimeRange(event.start, event.end, event.isAllDay)}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="truncate max-w-[200px]">{event.location}</span>
                          </div>
                        )}

                        {event.organizerEmail && (
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <User className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="truncate max-w-[180px]">{event.organizerEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
