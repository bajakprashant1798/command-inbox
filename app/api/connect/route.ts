import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateOAuthUrl } from "corsair/oauth";
import { corsair } from "@/server/corsair";
import { ensureCorsairTenantProvisioned } from "@/lib/corsair/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const searchParams = req.nextUrl.searchParams;
  const pluginId = searchParams.get("plugin") || "gmail";
  const email = session.user.email;
  
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host") || "localhost:3000";
  const redirectUri = `${protocol}://${host}/api/connect/callback`;
  
  try {
    await ensureCorsairTenantProvisioned(email);

    const { url } = await generateOAuthUrl(corsair, pluginId, {
      tenantId: email,
      redirectUri,
    });
    
    console.log("GENERATED OAUTH URL FOR", pluginId, "IS:", url);
    return NextResponse.redirect(url);
  } catch (err: any) {
    console.error("Error generating Corsair OAuth URL:", err);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
