import { CommandInput } from "@/components/command/command-input";
import { requireAuth } from "@/lib/auth/session";
import { getCorsairConnectionStatus } from "@/lib/auth/connection";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Command Center | MailCmd Inbox",
  description: "Natural language workspace actions executor",
};

export default async function CommandPage() {
  const user = await requireAuth();
  const status = await getCorsairConnectionStatus(user.email!);
  
  if (!status.connected) {
    redirect("/onboarding");
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950">
      <CommandInput />
    </div>
  );
}
