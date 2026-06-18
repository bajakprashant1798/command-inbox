import { getCorsairTenant } from "./client";

export interface GmailThread {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  timestamp: number;
}

export async function getInboxThreads(tenantId: string): Promise<GmailThread[]> {
  const tenant = getCorsairTenant(tenantId);
  
  try {
    const listResponse = await tenant.gmail.api.threads.list({ maxResults: 15 });
    const threads = listResponse.threads || [];
    
    if (threads.length === 0) {
      return [];
    }

    // Fetch details for all threads concurrently
    const enrichedThreads = await Promise.all(
      threads.map(async (t: any) => {
        try {
          const detail = await tenant.gmail.api.threads.get({ id: t.id });
          const messages = detail.messages || [];
          const firstMessage = messages[0];
          
          let sender = "Unknown Sender";
          let subject = "(No Subject)";
          let dateStr = "";
          let timestamp = Date.now();

          if (firstMessage) {
            const headers = firstMessage.payload?.headers || [];
            sender = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || sender;
            subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || subject;
            dateStr = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || dateStr;
            if (firstMessage.internalDate) {
              timestamp = parseInt(firstMessage.internalDate, 10);
            } else if (dateStr) {
              timestamp = new Date(dateStr).getTime();
            }
          }

          // Clean sender name (e.g., "LinkedIn <jobs-listings@linkedin.com>" -> "LinkedIn")
          const cleanSender = sender.replace(/<.*>/, "").trim() || sender;

          return {
            id: t.id,
            sender: cleanSender,
            subject,
            snippet: t.snippet || firstMessage?.snippet || "",
            date: dateStr,
            timestamp,
          };
        } catch (err) {
          console.error(`Error fetching thread detail for ${t.id}:`, err);
          return {
            id: t.id,
            sender: "Unknown",
            subject: "Error loading thread",
            snippet: t.snippet || "",
            date: "",
            timestamp: Date.now(),
          };
        }
      })
    );

    // Sort by timestamp descending
    return enrichedThreads.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error("Error in getInboxThreads service wrapper:", err);
    throw err;
  }
}
