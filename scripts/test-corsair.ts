import "dotenv/config";
import { corsair } from "../server/corsair";

async function main() {
  const tenant = corsair.withTenant("dev");
  try {
    console.log("Fetching Google Calendar events...");
    const events = await tenant.googlecalendar.api.events.getMany({
      calendarId: "primary",
      maxResults: 10,
    });
    console.log("Events response keys:", Object.keys(events));
    if (events.items) {
      console.log("Number of events:", events.items.length);
      console.log("Events sample:", JSON.stringify(events.items, null, 2).slice(0, 1000));
    }
  } catch (err) {
    console.error("Failed to fetch events:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => {
    setTimeout(() => process.exit(0), 1000);
  });