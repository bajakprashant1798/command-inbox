"use client";

import { signIn } from "next-auth/react";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl space-y-8 text-center animate-in fade-in duration-300">
        
        {/* Branding */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <Sparkles className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-wider">Command Inbox</h1>
            <p className="text-xs text-zinc-400 font-medium">AI Workspace for Gmail + Calendar</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-3 bg-zinc-950 p-5 rounded-xl border border-zinc-900/80 text-left font-sans">
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></span>
            <p className="text-xs text-zinc-450 leading-relaxed">
              <strong className="text-zinc-205">AI Action Engine:</strong> Process calendar events, resolve conflicts, and compose draft replies automatically using Gemini.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></span>
            <p className="text-xs text-zinc-455 leading-relaxed">
              <strong className="text-zinc-200">Interactive Agent Chat:</strong> Natural language conversation via MCP integrations to inspect your workspace data in real-time.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/inbox" })}
            className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl py-3.5 transition-all shadow-lg flex items-center justify-center gap-3 text-sm cursor-pointer"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </button>
          
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-zinc-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure OAuth 2.0 Encryption
          </div>
        </div>

      </div>
    </div>
  );
}
