import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

// 1. Zod Schemas for validation
export const ScheduleEventSchema = z.object({
  type: z.literal("SCHEDULE_EVENT"),
  title: z.string().default("Meeting"),
  description: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  attendees: z.array(z.string()).optional(),
}).transform((data) => {
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 1); // tomorrow
  defaultStart.setMinutes(0, 0, 0); // start of the hour
  
  const startTime = data.startTime || defaultStart.toISOString();
  const start = new Date(startTime);
  const endTime = data.endTime || new Date(start.getTime() + 60 * 60 * 1000).toISOString();
  
  return {
    ...data,
    startTime,
    endTime,
  };
});

export const SendEmailSchema = z.object({
  type: z.literal("SEND_EMAIL"),
  to: z.string().default("recipient@example.com"),
  subject: z.string().default("Workspace Update"),
  body: z.string().default("This email was drafted via Command Center. Please edit the content as needed."),
});

export const ComposedActionsSchema = z.object({
  type: z.literal("COMPOSED"),
  actions: z.array(z.union([ScheduleEventSchema, SendEmailSchema])),
});

export const CommandActionSchema = z.union([
  ScheduleEventSchema,
  SendEmailSchema,
  ComposedActionsSchema,
]);

export type CommandAction = z.infer<typeof CommandActionSchema>;

// 2. Gemini-compatible JSON Schema
const GeminiResponseSchema = {
  type: "OBJECT",
  properties: {
    type: { 
      type: "STRING", 
      enum: ["SCHEDULE_EVENT", "SEND_EMAIL", "COMPOSED"] 
    },
    title: { type: "STRING", description: "Title of the calendar event" },
    description: { type: "STRING", description: "Description/notes of the calendar event" },
    startTime: { type: "STRING", description: "ISO-8601 date string for event start time" },
    endTime: { type: "STRING", description: "ISO-8601 date string for event end time (should typically be 1 hour after start time)" },
    attendees: { 
      type: "ARRAY", 
      items: { type: "STRING" }, 
      description: "List of attendee email addresses" 
    },
    to: { type: "STRING", description: "Recipient email address for SEND_EMAIL action" },
    subject: { type: "STRING", description: "Subject of the email" },
    body: { type: "STRING", description: "Body/content of the email" },
    actions: {
      type: "ARRAY",
      description: "List of actions for COMPOSED type. Must contain only SCHEDULE_EVENT and/or SEND_EMAIL actions.",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: ["SCHEDULE_EVENT", "SEND_EMAIL"] },
          title: { type: "STRING" },
          description: { type: "STRING" },
          startTime: { type: "STRING" },
          endTime: { type: "STRING" },
          attendees: { type: "ARRAY", items: { type: "STRING" } },
          to: { type: "STRING" },
          subject: { type: "STRING" },
          body: { type: "STRING" }
        },
        required: ["type"]
      }
    }
  },
  required: ["type"]
};

// Helper to check for Gemini key
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Please configure it in your .env file.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function parseCommandWithGemini(command: string): Promise<CommandAction> {
  const ai = getGeminiClient();
  const nowIso = new Date().toISOString();

  const systemInstruction = `
You are an expert AI assistant that parses user instructions into structured database actions for a workspace inbox tool.
Analyze the user's natural language command and extract the structured intent.
You MUST output a JSON object adhering exactly to the response schema.

MANDATORY FIELDS:
- For SCHEDULE_EVENT: You MUST provide "title", "startTime", and "endTime". If the end time is not explicitly mentioned by the user, you MUST set "endTime" to exactly 1 hour after "startTime".
- For SEND_EMAIL: You MUST provide "to", "subject", and "body".

Current time reference: ${nowIso}
Resolve dates and times relative to this current time.
For example:
- "tomorrow at 4 PM" -> resolves to tomorrow's date at 16:00:00 ISO.
- "lunch tomorrow at 1 PM with teammate@example.com" -> resolves to tomorrow's date at 13:00:00 ISO, title "Lunch meeting", attendees ["teammate@example.com"].
- "send email to client@example.com about updates" -> type: "SEND_EMAIL", to: "client@example.com", subject: "...", body: "..."
- "schedule meeting with sarah@example.com tomorrow at 4 PM and send a confirmation" -> type: "COMPOSED", actions: [ SCHEDULE_EVENT, SEND_EMAIL ]
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: command,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: GeminiResponseSchema as any,
        temperature: 0.1, // low temperature for deterministic parsing
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsedJson = JSON.parse(textOutput);
    
    // Validate schema using Zod
    const validatedAction = CommandActionSchema.parse(parsedJson);
    return validatedAction;
  } catch (err: any) {
    console.error("Gemini parsing error:", err);
    throw new Error(`Gemini parsing failed: ${err.message || String(err)}`);
  }
}
