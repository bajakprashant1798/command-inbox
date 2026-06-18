"use client";

import { useState } from "react";
import { CommandAction } from "@/lib/ai/action-types";
import { 
  Sparkles, Play, Calendar, Mail, AlertCircle, CheckCircle2, 
  Loader2, ArrowRight, CalendarClock, ChevronRight, XCircle, Info
} from "lucide-react";

interface ExecutionStep {
  name: string;
  status: "idle" | "running" | "success" | "failed";
  error?: string;
}

export function CommandInput() {
  const [commandText, setCommandText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedAction, setParsedAction] = useState<CommandAction | null>(null);
  
  // Conflict States
  const [conflict, setConflict] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<{
    originalSlot: { startTime: string; endTime: string };
    suggestedSlot?: { startTime: string; endTime: string };
    message: string;
  } | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Execution States
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "success" | "failed">("idle");
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const suggestions = [
    "Schedule meeting with sarah@example.com tomorrow at 4 PM and send a confirmation email.",
    "Schedule lunch meeting with developer@example.com tomorrow at 1 PM.",
    "Send a project update email to manager@example.com.",
  ];

  // Submit command text to get preview actions
  const handleProcess = async () => {
    if (!commandText.trim()) return;
    setIsProcessing(true);
    setGeneralError(null);
    setSuccessMessage(null);
    setParsedAction(null);
    setConflict(false);
    setConflictDetails(null);
    setWarning(null);
    setExecutionStatus("idle");
    setExecutionSteps([]);

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process command");
      
      setParsedAction(data.action);
      if (data.conflict) {
        setConflict(true);
        setConflictDetails(data.conflictDetails);
      }
      if (data.warning) {
        setWarning(data.warning);
      }
    } catch (err: any) {
      setGeneralError(err.message || "Failed to process command");
    } finally {
      setIsProcessing(false);
    }
  };

  // Run the confirmed actions with step-by-step UI updates
  const handleRun = async () => {
    if (!parsedAction) return;
    setExecutionStatus("running");
    setGeneralError(null);

    // Initialize execution steps dynamically based on actions
    const steps: ExecutionStep[] = [
      { name: "Verifying Workspace credentials...", status: "running" }
    ];

    const actionsToRun = parsedAction.type === "COMPOSED" ? parsedAction.actions : [parsedAction];
    
    actionsToRun.forEach(act => {
      if (act.type === "SCHEDULE_EVENT") {
        steps.push({ name: `Scheduling event "${act.title}" on Google Calendar...`, status: "idle" });
      } else if (act.type === "SEND_EMAIL") {
        steps.push({ name: `Sending email to ${act.to} via Gmail...`, status: "idle" });
      }
    });

    setExecutionSteps(steps);

    // Helper to sleep/pause for visual effect
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Step 1: Verify Credentials
      await delay(1200);
      steps[0].status = "success";
      setExecutionSteps([...steps]);

      // Execute each action
      for (let i = 0; i < actionsToRun.length; i++) {
        const act = actionsToRun[i];
        const stepIndex = i + 1;
        steps[stepIndex].status = "running";
        setExecutionSteps([...steps]);

        await delay(1000); // artificial delay for premium execution step feel

        const res = await fetch("/api/command/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: act }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          steps[stepIndex].status = "failed";
          steps[stepIndex].error = data.error || "Execution failed";
          setExecutionSteps([...steps]);
          throw new Error(data.error || `Failed to run action ${act.type}`);
        } else {
          steps[stepIndex].status = "success";
          setExecutionSteps([...steps]);
        }
      }

      setExecutionStatus("success");
      setParsedAction(null);
      setCommandText("");
    } catch (err: any) {
      setExecutionStatus("failed");
      setGeneralError(err.message || "Failed to execute actions");
      // Mark running step as failed
      setExecutionSteps(prev => prev.map(s => s.status === "running" ? { ...s, status: "failed", error: err.message } : s));
    }
  };

  // Helper to update fields in the parsed action preview
  const handleUpdateField = (index: number | null, field: string, value: any) => {
    if (!parsedAction) return;

    if (parsedAction.type === "COMPOSED" && index !== null) {
      const updatedActions = [...parsedAction.actions];
      updatedActions[index] = { ...updatedActions[index], [field]: value } as any;
      setParsedAction({ ...parsedAction, actions: updatedActions });
    } else {
      setParsedAction({ ...parsedAction, [field]: value } as any);
    }
  };

  // Apply suggested slot
  const applySuggestedSlot = () => {
    if (!parsedAction || !conflictDetails?.suggestedSlot) return;
    const { startTime, endTime } = conflictDetails.suggestedSlot;

    if (parsedAction.type === "SCHEDULE_EVENT") {
      setParsedAction({
        ...parsedAction,
        startTime,
        endTime
      });
    } else if (parsedAction.type === "COMPOSED") {
      const updatedActions = parsedAction.actions.map(act => {
        if (act.type === "SCHEDULE_EVENT") {
          return { ...act, startTime, endTime };
        }
        return act;
      });
      setParsedAction({
        ...parsedAction,
        actions: updatedActions
      });
    }
    
    // Resolve the conflict indicator
    setConflict(false);
    setConflictDetails(null);
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const actionsList = parsedAction
    ? parsedAction.type === "COMPOSED"
      ? parsedAction.actions
      : [parsedAction]
    : [];

  return (
    <div className="flex-1 flex flex-col items-center bg-zinc-950 text-zinc-100 p-6 pt-16 lg:p-8 lg:pt-12 font-sans h-full overflow-y-auto">
      <div className="max-w-3xl w-full space-y-8 py-12">
        {/* Title */}
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" /> Command Center
          </h2>
          <p className="text-sm text-zinc-400">
            Parse and run Google Workspace actions instantly using Gemini AI models.
          </p>
        </div>

        {/* Command Input Area */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <textarea
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            disabled={isProcessing || executionStatus === "running"}
            placeholder="Schedule meeting with sarah@example.com tomorrow at 4 PM and send a confirmation email."
            className="w-full h-32 bg-transparent text-lg text-zinc-100 placeholder-zinc-650 focus:outline-none resize-none leading-relaxed disabled:opacity-55"
          />
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-zinc-800/60 pt-4">
            <p className="text-xs text-zinc-500 font-mono">
              Workspace actions will request live API confirmations
            </p>
            <button
              onClick={handleProcess}
              disabled={isProcessing || executionStatus === "running" || !commandText.trim()}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-950/20 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Querying Gemini...
                </>
              ) : (
                <>
                  Parse Command <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {!parsedAction && executionStatus !== "running" && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-500 font-mono uppercase">Suggestions</h4>
            <div className="flex flex-col gap-2.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setCommandText(s)}
                  className="text-left text-xs bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/80 p-3 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all font-sans"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Warnings & Alerts */}
        {warning && (
          <div className="flex items-start gap-3 bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl text-amber-400 text-xs font-mono">
            <Info className="w-5 h-5 flex-shrink-0 text-amber-500" />
            <p>{warning}</p>
          </div>
        )}

        {generalError && (
          <div className="flex items-start gap-3 bg-red-950/30 border border-red-900/40 p-4 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold">Error Occurred</p>
              <p className="text-xs text-red-400/90 mt-1">{generalError}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 bg-emerald-950/30 border border-emerald-900/40 p-4 rounded-xl text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Conflict Detection Banner */}
        {conflict && conflictDetails && (
          <div className="bg-amber-950/30 border border-amber-900/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <h4 className="font-semibold text-amber-400 text-sm flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-500" /> Schedule Conflict Detected
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {conflictDetails.message}
              </p>
              {conflictDetails.suggestedSlot && (
                <p className="text-xs text-zinc-300 font-mono">
                  Suggested alternative slot: {new Date(conflictDetails.suggestedSlot.startTime).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              )}
            </div>
            {conflictDetails.suggestedSlot && (
              <button
                onClick={applySuggestedSlot}
                className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold text-xs px-4 py-2 rounded-lg transition-all flex-shrink-0 text-center"
              >
                Use Suggested Slot
              </button>
            )}
          </div>
        )}

        {/* Pipeline Execution Progress */}
        {executionStatus !== "idle" && executionSteps.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">
              Workspace Execution Logs
            </h4>
            
            <div className="space-y-3.5">
              {executionSteps.map((step, idx) => {
                let icon = <div className="w-4.5 h-4.5 rounded-full border border-zinc-800 flex-shrink-0" />;
                let textClass = "text-zinc-500";

                if (step.status === "running") {
                  icon = <Loader2 className="w-4.5 h-4.5 text-indigo-400 animate-spin flex-shrink-0" />;
                  textClass = "text-zinc-200 font-medium";
                } else if (step.status === "success") {
                  icon = <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />;
                  textClass = "text-zinc-400";
                } else if (step.status === "failed") {
                  icon = <XCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />;
                  textClass = "text-red-400 font-semibold";
                }

                return (
                  <div key={idx} className="flex items-start gap-3 text-sm transition-all duration-200">
                    {icon}
                    <div className="flex-1 min-w-0">
                      <p className={textClass}>{step.name}</p>
                      {step.error && (
                        <p className="text-[11px] text-red-500 font-mono mt-1 leading-relaxed bg-red-950/20 p-2 rounded border border-red-900/20 break-words">
                          Error: {step.error}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {executionStatus === "success" && (
              <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl text-xs text-emerald-400/90 leading-relaxed pt-3">
                All action requests finished successfully! Check your Gmail and Google Calendar to see the new messages/events.
              </div>
            )}
          </div>
        )}

        {/* Action Previews */}
        {parsedAction && executionStatus === "idle" && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold tracking-wider text-indigo-400 font-mono uppercase">
              Parsed Actions Previews
            </h3>
            
            <div className="space-y-4">
              {actionsList.map((action, index) => {
                const actionIdx = parsedAction.type === "COMPOSED" ? index : null;
                
                if (action.type === "SCHEDULE_EVENT") {
                  return (
                    <div
                      key={index}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 border-l-4 border-l-indigo-600"
                    >
                      <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm font-mono uppercase">
                        <Calendar className="w-4 h-4 text-indigo-500" /> Schedule Event
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase">Title</label>
                          <input
                            type="text"
                            value={action.title}
                            onChange={(e) => handleUpdateField(actionIdx, "title", e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-650"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase">Attendees</label>
                          <input
                            type="text"
                            value={action.attendees?.join(", ") || ""}
                            onChange={(e) => handleUpdateField(actionIdx, "attendees", e.target.value.split(",").map(s => s.trim()))}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-650"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase">Start Time</label>
                          <input
                            type="text"
                            value={action.startTime}
                            onChange={(e) => handleUpdateField(actionIdx, "startTime", e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-650 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase">End Time</label>
                          <input
                            type="text"
                            value={action.endTime}
                            onChange={(e) => handleUpdateField(actionIdx, "endTime", e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-650 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (action.type === "SEND_EMAIL") {
                  return (
                    <div
                      key={index}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 border-l-4 border-l-indigo-600"
                    >
                      <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm font-mono uppercase">
                        <Mail className="w-4 h-4 text-indigo-500" /> Send Email
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase">To</label>
                            <input
                              type="email"
                              value={action.to}
                              onChange={(e) => handleUpdateField(actionIdx, "to", e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-650"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase">Subject</label>
                            <input
                              type="text"
                              value={action.subject}
                              onChange={(e) => handleUpdateField(actionIdx, "subject", e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-650"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase">Body</label>
                          <textarea
                            value={action.body}
                            onChange={(e) => handleUpdateField(actionIdx, "body", e.target.value)}
                            className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-650 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Run Actions Button */}
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setParsedAction(null)}
                className="text-zinc-500 hover:text-zinc-300 font-medium text-sm transition-colors px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRun}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-950/20 text-sm"
              >
                <Play className="w-4 h-4 fill-current" /> Run Actions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
