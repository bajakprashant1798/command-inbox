import { NextResponse } from "next/server";
import { getInboxThreads } from "@/lib/corsair/gmail";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const threads = await getInboxThreads(session.user.email);
    return NextResponse.json({ threads });
  } catch (err: any) {
    console.error("Failed to refresh inbox threads:", err);
    return NextResponse.json(
      { error: err.message || "Failed to refresh threads" },
      { status: 500 }
    );
  }
}
