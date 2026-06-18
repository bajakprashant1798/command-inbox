"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, Bot, User, Loader2, RefreshCw, 
  Terminal, ShieldCheck, Play, ArrowRight, MessageSquare 
} from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your MCP workspace agent. I have tools to inspect your Gmail inbox, search for unread emails, check your calendar availability, schedule meetings, and send emails directly. How can I help you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { label: "Summarize my inbox", prompt: "Give me a quick summary of the threads in my inbox." },
    { label: "Find unread emails", prompt: "Do I have any unread emails? If so, list them." },
    { label: "Find availability tomorrow", prompt: "Check my calendar availability for tomorrow." },
    { label: "Send update email", prompt: "Send an email to dev@example.com about project update saying everything is running smoothly." }
  ];

  // Check connection status on mount
  useEffect(() => {
    fetch("/api/connect/status")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.connected === false) {
          window.location.href = "/onboarding";
        }
      })
      .catch((err) => console.error("Error checking connection status", err));
  }, []);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, statusLogs]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);
    setStatusLogs([]);
    const updatedMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updatedMessages);
    setInputValue("");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to communicate with agent.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream available.");
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      // Initialize the assistant message slot
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || ""; // keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim().startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.type === "text") {
                  setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === "assistant") {
                      return [
                        ...prev.slice(0, -1),
                        { ...last, content: last.content + parsed.delta }
                      ];
                    }
                    return prev;
                  });
                } else if (parsed.type === "status") {
                  setStatusLogs(prev => {
                    if (prev[prev.length - 1] === parsed.message) return prev;
                    return [...prev, parsed.message];
                  });
                } else if (parsed.type === "error") {
                  setError(parsed.error);
                }
              } catch (e) {
                console.error("SSE parse error", e, line);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full bg-zinc-950 font-sans overflow-hidden">
      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-zinc-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between flex-shrink-0 bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-sm font-semibold text-white">MCP Agent Chat</h2>
              <p className="text-[10px] text-zinc-500 font-mono">
                Active Provider: OpenAI GPT-4o
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Tenant: dev
            </div>
            <button 
              onClick={() => setMessages([{ role: "assistant", content: "Chat reset. How can I help you today?" }])}
              className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded transition-all hover:bg-zinc-900"
              title="Reset conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Port */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950/20">
          {messages.map((msg, index) => {
            const isBot = msg.role === "assistant";
            return (
              <div 
                key={index}
                className={`flex gap-4 max-w-3xl ${isBot ? "" : "ml-auto flex-row-reverse"}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                  isBot ? "bg-indigo-650 text-white" : "bg-zinc-800 text-zinc-200"
                }`}>
                  {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                </div>

                <div className={`space-y-1.5 max-w-[85%] ${isBot ? "" : "text-right"}`}>
                  <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                    {isBot ? "Agent" : "You"}
                  </span>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isBot 
                      ? "bg-zinc-900/60 border border-zinc-900 text-zinc-200" 
                      : "bg-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                  }`}>
                    {msg.content === "" && isLoading && index === messages.length - 1 ? (
                      <span className="flex items-center gap-1.5 text-zinc-500 font-mono text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
                      </span>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts & Input Box */}
        <div className="p-6 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex-shrink-0 space-y-4">
          {messages.length === 1 && !isLoading && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Suggested Actions</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(s.prompt)}
                    className="text-left text-xs bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/80 px-4 py-3 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all flex items-center justify-between group"
                  >
                    <span>{s.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-650 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-950/20 border border-red-900/30 p-3.5 rounded-xl text-xs text-red-400">
              Error: {error}
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(inputValue);
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? "Agent is working..." : "Ask the agent to summarize, check availability, or send email..."}
              className="w-full bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-650 focus:outline-none rounded-xl py-3.5 pl-4 pr-12 text-sm text-zinc-100 placeholder-zinc-500 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2.5 p-2 bg-indigo-650 hover:bg-indigo-550 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Tool Execution Logs Console Panel */}
      <div className="w-full lg:w-80 bg-zinc-900/20 border-t lg:border-t-0 lg:border-l border-zinc-900 flex flex-col h-72 lg:h-full overflow-hidden flex-shrink-0">
        <div className="px-5 py-4 border-b border-zinc-900 flex items-center gap-2 bg-zinc-900/40">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
            Workspace Console Logs
          </h3>
        </div>

        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-zinc-400 space-y-3 bg-zinc-950/40 select-none">
          {statusLogs.length === 0 ? (
            <div className="text-zinc-600 italic">Console is idle. Trigger actions to inspect operations.</div>
          ) : (
            statusLogs.map((log, index) => {
              const isExecuting = log.startsWith("Executing");
              return (
                <div key={index} className="flex items-start gap-2 animate-in fade-in duration-200">
                  <span className="text-zinc-650 text-[10px]">
                    [{new Date().toLocaleTimeString("en-US", { hour12: false })}]
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    {isExecuting ? (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin flex-shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0"></span>
                    )}
                    <span className={isExecuting ? "text-indigo-400" : "text-emerald-500"}>
                      {log}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
