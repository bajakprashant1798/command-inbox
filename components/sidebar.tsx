"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Calendar, Terminal, Sparkles, MessageSquare, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login" || pathname === "/onboarding") {
    return null;
  }

  const navItems = [
    {
      name: "Inbox",
      href: "/inbox",
      icon: Inbox,
      description: "Emails & notifications",
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
      description: "Schedule & events",
    },
    {
      name: "Command Center",
      href: "/command",
      icon: Terminal,
      description: "AI action engine",
    },
    {
      name: "MCP Agent Chat",
      href: "/agent",
      icon: MessageSquare,
      description: "Interactive agent chat",
    },
  ];

  return (
    <aside className="w-64 bg-zinc-900 text-zinc-100 flex flex-col h-screen border-r border-zinc-800 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center shadow-md shadow-indigo-900/30">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-wide text-white font-sans">COMMAND INBOX</h1>
          <p className="text-[10px] text-zinc-500 font-mono">v1.0.0</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group duration-150 relative ${
                isActive
                  ? "bg-zinc-800/80 text-white shadow-sm border-l-2 border-indigo-500 rounded-l-none"
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                  isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                }`}
              />
              <div className="flex flex-col">
                <span>{item.name}</span>
                <span className="text-[10px] text-zinc-500 font-normal group-hover:text-zinc-400 transition-colors">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-5 border-t border-zinc-800 flex flex-col gap-3.5 bg-zinc-900/30 flex-shrink-0">
        {user ? (
          <div className="flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User Avatar"}
                className="w-9 h-9 rounded-full border border-zinc-700 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-650 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate leading-snug">{user.name || "Workspace User"}</p>
              <p className="text-[10px] text-zinc-500 truncate mt-0.5 leading-none font-mono">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-zinc-500 font-mono">Not logged in</div>
        )}
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>Status:</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Connected
            </span>
          </div>
          
          {user && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-red-950/20 hover:text-red-400 text-zinc-400 hover:border-red-900/30 transition-all border border-zinc-850 text-xs font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
