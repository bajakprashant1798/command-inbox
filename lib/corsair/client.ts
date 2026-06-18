import { corsair } from "@/server/corsair";
import { setupCorsair } from "corsair";

export function getCorsairTenant(tenantId: string) {
  if (!tenantId) {
    throw new Error("tenantId is required to get Corsair tenant");
  }
  return corsair.withTenant(tenantId);
}

export async function ensureCorsairTenantProvisioned(tenantId: string) {
  if (!tenantId) return;
  try {
    await setupCorsair(corsair, { tenantId });
  } catch (err) {
    console.error(`Failed to provision Corsair tenant for ${tenantId}:`, err);
  }
}
