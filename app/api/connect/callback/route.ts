import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processOAuthCallback } from "corsair/oauth";
import { corsair } from "@/server/corsair";
import { getCorsairConnectionStatus } from "@/lib/auth/connection";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  
  if (!code || !state) {
    return new Response("Missing code or state", { status: 400 });
  }
  
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host") || "localhost:3000";
  const redirectUri = `${protocol}://${host}/api/connect/callback`;
  
  try {
    // Process the OAuth callback and save the credentials in the DB under user email
    await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri,
    });
    
    // Check if both plugins are now connected
    const email = session.user.email;
    const status = await getCorsairConnectionStatus(email);
    
    const origin = `${protocol}://${host}`;
    if (!status.gmail) {
      return NextResponse.redirect(`${origin}/api/connect?plugin=gmail`);
    } else if (!status.calendar) {
      return NextResponse.redirect(`${origin}/api/connect?plugin=googlecalendar`);
    } else {
      return NextResponse.redirect(`${origin}/inbox`);
    }
  } catch (err: any) {
    console.error("Error processing Corsair OAuth callback:", err);
    return new Response(`OAuth Callback Error: ${err.message}`, { status: 500 });
  }
}
