import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCorsairConnectionStatus } from "@/lib/auth/connection";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const status = await getCorsairConnectionStatus(session.user.email);
    return NextResponse.json(status);
  } catch (err: any) {
    console.error("Failed to get connection status:", err);
    return NextResponse.json(
      { error: err.message || "Failed to get connection status" },
      { status: 500 }
    );
  }
}
