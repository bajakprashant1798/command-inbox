import Link from "next/link";
import { auth } from "@/lib/auth";
import { Sparkles, ArrowRight, Inbox, Calendar, Terminal, MessageSquare, ShieldCheck, Zap, RefreshCw } from "lucide-react";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="relative flex-1 flex flex-col min-h-screen bg-zinc-950 text-zinc-100 overflow-y-auto overflow-x-hidden font-sans select-none scroll-smooth">
      {/* Embedded Custom Background Animations */}
      <style>{`
        @keyframes float-slow {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float-medium {
          0% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-50px, 50px) scale(0.85); }
          100% { transform: translate(0px, 0px) scale(1.1); }
        }
        .animate-blob-1 {
          animation: float-slow 20s infinite ease-in-out;
        }
        .animate-blob-2 {
          animation: float-medium 25s infinite ease-in-out;
        }
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(63, 63, 70, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(63, 63, 70, 0.05) 1px, transparent 1px);
        }
      `}</style>

      {/* Glow Effects in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] animate-blob-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] animate-blob-2" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-900/5 blur-[100px] animate-blob-1" />
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950 pointer-events-none" />
      </div>

      {/* Header / Navbar */}
      <header className="relative z-10 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/icon.png" alt="MailCmd Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-widest text-white uppercase font-sans">MailCmd Inbox</h1>
            <p className="text-[9px] text-zinc-500 font-mono tracking-wider">WORKSPACE COMPILER</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href={isLoggedIn ? "/inbox" : "/login"}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            {isLoggedIn ? "Go to Inbox" : "Sign In"}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8 flex-shrink-0">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-900/50 px-3.5 py-1.5 rounded-full text-[10px] font-mono text-indigo-400 mx-auto w-fit">
          <Zap className="w-3.5 h-3.5 text-indigo-400 animate-bounce" /> Smart AI Assistant Active
        </div>

        {/* Hero Headlines */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] font-sans">
            Your Email & Calendar. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-300% animate-pulse">
              Handled by AI.
            </span>
          </h2>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            MailCmd Inbox is your smart virtual assistant. It reads your emails, checks your schedule, detects meeting details, resolves double-bookings, and drafts replies for you in plain English.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={isLoggedIn ? "/inbox" : "/login"}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-7 py-3.5 font-medium transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 group text-sm cursor-pointer"
          >
            {isLoggedIn ? "Launch Workspace" : "Get Started with Google"}
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl px-7 py-3.5 font-medium transition-all text-sm flex items-center justify-center"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Interactive Mockup Dashboard (Self-contained HTML/CSS visual mockup) */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 flex-shrink-0">
        <div className="relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-sm overflow-hidden space-y-6">
          {/* Mock Window Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 block" />
            </div>
            <div className="bg-zinc-950/80 px-4 py-1.5 rounded-lg border border-zinc-850 text-[10px] font-mono text-zinc-500 w-64 text-center truncate">
              http://localhost:3000/inbox
            </div>
            <div className="w-10 h-3" />
          </div>

          {/* Grid Layout simulating the app interface */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Simulation Pane 1: Inbox Item */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">Incoming Email</span>
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 text-[9px] font-mono border border-indigo-900/40">Smart Reader</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white truncate">Meeting Request: Project Sync</p>
                <p className="text-[10px] text-zinc-450 truncate">sender: rockhappy1798@gmail.com</p>
              </div>
              <div className="bg-zinc-900/50 p-2.5 rounded border border-zinc-900 text-[10px] text-zinc-400 leading-relaxed italic">
                "Hi, let's schedule our project sync tomorrow between 4 PM and 5 PM..."
              </div>
            </div>

            {/* Simulation Pane 2: Gemini Action Engine */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">Assistant Suggestion</span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Time Available
                </span>
              </div>
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between text-zinc-400">
                  <span>Suggested Start:</span>
                  <span className="text-white font-mono">Tomorrow 4:00 PM</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Suggested End:</span>
                  <span className="text-white font-mono">Tomorrow 5:00 PM</span>
                </div>
                <div className="p-2 rounded bg-indigo-900/20 border border-indigo-900/40 text-indigo-300">
                  Checking your calendar... You're free! Click to schedule.
                </div>
              </div>
            </div>

            {/* Simulation Pane 3: MCP Agent Chat */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">Chat with Assistant</span>
                <span className="text-[9px] text-purple-400 font-mono">AI Assistant</span>
              </div>
              <div className="space-y-2">
                <div className="bg-zinc-900 p-2 rounded text-[10px] text-zinc-300 text-right w-[85%] ml-auto border border-zinc-850">
                  Check my agenda for tomorrow.
                </div>
                <div className="bg-indigo-950/20 p-2.5 rounded text-[10px] text-zinc-300 border border-indigo-900/20 w-[90%] space-y-1">
                  <p className="font-semibold text-white">Assistant Response:</p>
                  <p className="text-zinc-455 leading-normal">Tomorrow you have 2 meetings. The first is at 4:00 PM with Rock Happy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t border-zinc-900 flex-shrink-0 space-y-12">
        <div className="text-center space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-sans">
            Smart Features. Made Simple.
          </h3>
          <p className="text-xs md:text-sm text-zinc-400 max-w-lg mx-auto">
            We combine smart artificial intelligence with your calendar and email to handle scheduling automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 p-6 rounded-xl transition-all hover:-translate-y-0.5 duration-350 space-y-4 hover:shadow-lg hover:shadow-indigo-950/10 group">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-900/40 flex items-center justify-center group-hover:scale-105 transition-all">
              <Terminal className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-white">Smart Scheduler</h4>
              <p className="text-xs text-zinc-455 leading-relaxed">
                Automatically reads emails to find proposed times, checks your calendar for double-bookings, and lets you book meetings instantly.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 p-6 rounded-xl transition-all hover:-translate-y-0.5 duration-350 space-y-4 hover:shadow-lg hover:shadow-purple-950/10 group">
            <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-900/40 flex items-center justify-center group-hover:scale-105 transition-all">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-white">Chat Assistant</h4>
              <p className="text-xs text-zinc-455 leading-relaxed">
                Talk to your virtual assistant in plain English. Ask it to check your schedule, find unread emails, or write draft replies.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 p-6 rounded-xl transition-all hover:-translate-y-0.5 duration-350 space-y-4 hover:shadow-lg hover:shadow-blue-950/10 group">
            <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-900/40 flex items-center justify-center group-hover:scale-105 transition-all">
              <RefreshCw className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-white">Instant Updates</h4>
              <p className="text-xs text-zinc-455 leading-relaxed">
                Your email inbox and calendar sync automatically. Any new message or scheduling changes show up immediately.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 p-6 rounded-xl transition-all hover:-translate-y-0.5 duration-350 space-y-4 hover:shadow-lg hover:shadow-emerald-950/10 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-900/40 flex items-center justify-center group-hover:scale-105 transition-all">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-white">Safe & Private</h4>
              <p className="text-xs text-zinc-455 leading-relaxed">
                Your data is protected. We connect safely to your Google accounts, encrypt your credentials, and keep everything completely private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Specs */}
      <footer className="relative z-10 w-full border-t border-zinc-900 bg-zinc-950/50 py-8 px-6 text-center space-y-4 flex-shrink-0 mt-auto">
        <p className="text-[10px] text-zinc-500 font-mono">
          MAILCMD INBOX — BOOTSTRAPPED FOR HIGH-SPEED HACKATHON PERFORMANCE
        </p>
        <div className="flex justify-center gap-6 text-[10px] text-zinc-400 font-mono">
          <span>NEXT.JS 16.2</span>
          <span>•</span>
          <span>GEMINI 2.0</span>
          <span>•</span>
          <span>AUTH.JS V5</span>
          <span>•</span>
          <span>MCP PROTOCOL</span>
        </div>
      </footer>
    </div>
  );
}
