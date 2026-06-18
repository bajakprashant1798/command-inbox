import "dotenv/config";
import { corsair } from "../server/corsair";

async function main() {
  const tenant = corsair.withTenant("dev");
  
  console.log("gmail.api.threads keys:", Object.keys(tenant.gmail.api.threads || {}));
  console.log("gmail.api.messages keys:", Object.keys(tenant.gmail.api.messages || {}));
  console.log("googlecalendar.api.events keys:", Object.keys(tenant.googlecalendar.api.events || {}));
  console.log("googlecalendar.api.calendar keys:", Object.keys(tenant.googlecalendar.api.calendar || {}));
  
  // Let's print the prototype of corsair and keys of corsair properties
  console.log("corsair prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(corsair)));
  
  // Let's look for any webhook handle/match methods on corsair itself
  const proto = Object.getPrototypeOf(corsair);
  const allProps = [...Object.getOwnPropertyNames(corsair), ...Object.getOwnPropertyNames(proto)];
  console.log("All properties on corsair:", allProps.filter(p => p.toLowerCase().includes("webhook") || p.toLowerCase().includes("handle") || p.toLowerCase().includes("dispatch") || p.toLowerCase().includes("receive")));
  
  // Let's check permissions keys
  console.log("corsair.permissions keys:", Object.keys(corsair.permissions || {}));
}

main().catch(console.error);
