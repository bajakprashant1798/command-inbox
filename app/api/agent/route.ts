import { NextRequest, NextResponse } from "next/server";
import { Runner, user, assistant, system } from "@openai/agents";
import { getCorsairAgent, openAIProvider } from "@/lib/agent/corsair-agent";
import { auth } from "@/lib/auth";

// Simple IP-based rate limiter map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(req: NextRequest) {
  try {
    // 0. Verify Auth Session
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tenantId = session.user.email;
    // 0. Rate Limiting Check (10 requests per minute)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const now = Date.now();
    const limitRecord = rateLimitMap.get(ip);
    
    let remainingCount = 9;
    let resetTimeEpoch = Math.ceil((now + 60 * 1000) / 1000);

    if (limitRecord && now < limitRecord.resetTime) {
      if (limitRecord.count >= 10) {
        const secondsLeft = Math.ceil((limitRecord.resetTime - now) / 1000);
        return NextResponse.json(
          { error: `Too many requests. Please try again in ${secondsLeft} seconds.` },
          { 
            status: 429,
            headers: {
              "Retry-After": String(secondsLeft),
              "X-RateLimit-Limit": "10",
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(Math.ceil(limitRecord.resetTime / 1000)),
            }
          }
        );
      }
      limitRecord.count += 1;
      remainingCount = Math.max(0, 10 - limitRecord.count);
      resetTimeEpoch = Math.ceil(limitRecord.resetTime / 1000);
    } else {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + 60 * 1000,
      });
      remainingCount = 9;
      resetTimeEpoch = Math.ceil((now + 60 * 1000) / 1000);
    }

    // 1. Verify OpenAI API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment variables. Please add it to your .env file." },
        { status: 400 }
      );
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    // 2. Map history to OpenAI Agent input items
    const agentMessages = messages.map((m: any) => {
      if (m.role === "system") {
        return system(m.content);
      } else if (m.role === "assistant") {
        return assistant(m.content);
      } else {
        return user(m.content);
      }
    });

    const agent = getCorsairAgent(tenantId);

    // 3. Execute the agent run in streaming mode
    const runner = new Runner({
      modelProvider: openAIProvider,
    });

    const result = await runner.run(agent, agentMessages, {
      stream: true,
      maxTurns: 10,
    });

    const encoder = new TextEncoder();
    const activeTools = new Map<string, string>();

    // 4. Stream response using Server-Sent Events (SSE)
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of result) {
            if (
              event.type === "raw_model_stream_event" &&
              event.data.type === "output_text_delta"
            ) {
              const delta = event.data.delta;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", delta })}\n\n`)
              );
            } else if (
              event.type === "run_item_stream_event" &&
              event.name === "tool_called"
            ) {
              const toolItem = event.item as any;
              const name = toolItem.toolName || "tool";
              const callId = toolItem.callId;
              if (callId) {
                activeTools.set(callId, name);
              }
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "status", message: `Executing ${name}...` })}\n\n`)
              );
            } else if (
              event.type === "run_item_stream_event" &&
              event.name === "tool_output"
            ) {
              const toolItem = event.item as any;
              const callId = toolItem.callId;
              const name = (callId && activeTools.get(callId)) || "tool";
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "status", message: `Completed ${name}` })}\n\n`)
              );
            }
          }
        } catch (err: any) {
          console.error("Stream runner error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: err.message || String(err) })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": String(remainingCount),
        "X-RateLimit-Reset": String(resetTimeEpoch),
      },
    });
  } catch (err: any) {
    console.error("POST /api/agent error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to execute agent" },
      { status: 500 }
    );
  }
}
