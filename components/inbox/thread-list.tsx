"use client";

import { useState, useTransition } from "react";
import { GmailThread } from "@/lib/corsair/gmail";
import { Search, Mail, MailOpen, Calendar, ChevronRight, RefreshCw, Sparkles } from "lucide-react";

interface ThreadListProps {
  initialThreads: GmailThread[];
}

export function ThreadList({ initialThreads }: ThreadListProps) {
  const [threads, setThreads] = useState<GmailThread[]>(initialThreads);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThread, setSelectedThread] = useState<GmailThread | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "primary" | "social" | "updates">("all");
  const [isPending, startTransition] = useTransition();

  // Simple local search filtering
  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.snippet.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!matchesSearch) return false;
    
    // Categorize threads based on sender/subject for filtering tabs
    if (activeTab === "social") {
      return t.sender.toLowerCase().includes("linkedin") || t.sender.toLowerCase().includes("facebook") || t.sender.toLowerCase().includes("twitter");
    }
    if (activeTab === "updates") {
      return t.sender.toLowerCase().includes("google") || t.sender.toLowerCase().includes("aws") || t.sender.toLowerCase().includes("inngest") || t.subject.toLowerCase().includes("billing") || t.subject.toLowerCase().includes("confirm");
    }
    if (activeTab === "primary") {
      const isSocial = t.sender.toLowerCase().includes("linkedin") || t.sender.toLowerCase().includes("facebook");
      const isUpdate = t.sender.toLowerCase().includes("google") || t.sender.toLowerCase().includes("aws") || t.subject.toLowerCase().includes("billing");
      return !isSocial && !isUpdate;
    }
    
    return true;
  });

  // Relative time formatter
  function formatRelativeTime(timestamp: number) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Refetch action
  const handleRefresh = async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/inbox/refresh");
        if (res.ok) {
          const data = await res.json();
          setThreads(data.threads);
        }
      } catch (err) {
        console.error("Failed to refresh threads", err);
      }
    });
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden text-zinc-100 font-sans">
      {/* Threads List Pane */}
      <div className="flex-1 flex flex-col h-full border-r border-zinc-900 bg-zinc-950">
        {/* Header */}
        <header className="px-8 py-6 border-b border-zinc-900 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Inbox
            </h2>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              {filteredThreads.length} threads found
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all border border-zinc-800 disabled:opacity-50 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
            Sync Mail
          </button>
        </header>

        {/* Search & Tabs */}
        <div className="px-8 py-4 border-b border-zinc-900 space-y-4 bg-zinc-950/50 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search sender, subject, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-905 border border-zinc-900 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans"
            />
          </div>

          <div className="flex gap-2">
            {(["all", "primary", "updates", "social"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-all ${
                  activeTab === tab
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                    : "bg-transparent border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Threads Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/40">
          {filteredThreads.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 flex flex-col items-center justify-center h-64 border border-dashed border-zinc-900 rounded-2xl bg-zinc-900/10 m-8">
              <MailOpen className="w-8 h-8 text-zinc-700 mb-3" />
              <p className="text-sm">Inbox Zero. You are all caught up!</p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isSelected = selectedThread?.id === thread.id;
              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`flex items-start gap-4 p-5 hover:bg-zinc-900/30 cursor-pointer transition-all border-l-2 relative ${
                    isSelected
                      ? "bg-zinc-900/50 border-l-indigo-500"
                      : "border-l-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-sm text-zinc-100 truncate">
                        {thread.sender}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono flex-shrink-0">
                        {formatRelativeTime(thread.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-300 truncate font-medium">
                      {thread.subject}
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {thread.snippet}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 mt-1 self-start flex-shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Thread Drawer / Preview Panel */}
      {selectedThread ? (
        <div className="w-[480px] h-full bg-zinc-900/90 flex flex-col border-l border-zinc-900 shadow-2xl overflow-y-auto animate-in slide-in-from-right-4 duration-200 z-20">
          <header className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40 sticky top-0 backdrop-blur-md z-10">
            <div>
              <span className="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded font-mono uppercase">
                Thread: {selectedThread.id}
              </span>
              <h3 className="text-base font-semibold text-white mt-2 leading-tight">
                {selectedThread.subject}
              </h3>
            </div>
            <button
              onClick={() => setSelectedThread(null)}
              className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-colors px-2 py-1 hover:bg-zinc-800 rounded"
            >
              Close
            </button>
          </header>

          <div className="p-6 space-y-6">
            {/* Sender and Time info */}
            <div className="flex items-start justify-between border-b border-zinc-800/50 pb-4">
              <div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase">From</p>
                <p className="text-sm font-semibold text-zinc-200">{selectedThread.sender}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 font-mono uppercase">Date</p>
                <p className="text-xs text-zinc-300 font-mono">
                  {new Date(selectedThread.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Message Body Cache */}
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">Content Snippet</p>
              <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-900 text-sm text-zinc-300 leading-relaxed font-sans shadow-inner">
                {selectedThread.snippet}
              </div>
            </div>

            {/* Suggested AI Actions */}
            <div className="bg-indigo-950/10 border border-indigo-900/30 p-5 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5" /> SUGGESTED ACTION
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Suggested schedule options are available. Go to the Command Center and prompt:
              </p>
              <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-900 text-[11px] font-mono text-zinc-300 select-all">
                "Schedule a meeting regarding: {selectedThread.subject}"
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-[480px] h-full hidden lg:flex flex-col items-center justify-center bg-zinc-950 text-zinc-700 border-l border-zinc-900 select-none">
          <Mail className="w-10 h-10 text-zinc-800/80 mb-2 animate-pulse" />
          <p className="text-xs font-medium font-mono uppercase tracking-wider">Select thread to view details</p>
        </div>
      )}
    </div>
  );
}
