import { requireAuth } from "@/lib/auth/session";
import { getCorsairConnectionStatus } from "@/lib/auth/connection";
import { redirect } from "next/navigation";
import { Sparkles, Mail, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function OnboardingPage() {
  const user = await requireAuth();
  const status = await getCorsairConnectionStatus(user.email!);
  
  if (status.connected) {
    redirect("/inbox");
  }
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl space-y-8 text-center animate-in fade-in duration-300">
        
        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Connect Gmail & Calendar</h2>
            <p className="text-xs text-zinc-500 font-mono mt-1">AI Workspace for Gmail + Calendar</p>
          </div>
        </div>

        {/* Info list */}
        <div className="space-y-4 text-left bg-zinc-950 p-5 rounded-xl border border-zinc-900">
          <div className="flex gap-3">
            <Mail className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-zinc-200">Gmail Access</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Analyze unread threads, search messages, and draft replies using Gemini.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Calendar className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-zinc-200">Google Calendar Access</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Check free/busy slots, find scheduling conflicts, and create events.
              </p>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 justify-center text-[10px] text-zinc-500 font-mono bg-zinc-900/50 py-1.5 px-3 rounded-lg border border-zinc-850 w-fit mx-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Isolated tenant: {user.email}
        </div>

        {/* Action */}
        <div className="space-y-3">
          <Link
            href={status.gmail ? "/api/connect?plugin=googlecalendar" : "/api/connect?plugin=gmail"}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 font-medium transition-all shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2 group text-sm font-sans"
          >
            {status.gmail ? "Connect Google Calendar" : "Connect Workspace"}
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
          <p className="text-[10px] text-zinc-500 text-center leading-relaxed px-4">
            Auth.js login is kept separate from Google workspace API credentials. You will authorize access to your Gmail and Calendar accounts individually in the next steps.
          </p>
        </div>

      </div>
    </div>
  );
}
