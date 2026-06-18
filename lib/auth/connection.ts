import { prisma } from "@/lib/db/prisma";

export async function getCorsairConnectionStatus(email: string) {
  try {
    const accounts = await prisma.corsairAccount.findMany({
      where: { tenantId: email },
      include: {
        integration: true,
      },
    });
    
    const connectedGmail = accounts.some(a => {
      if (a.integration.name !== "gmail") return false;
      const config = a.config as Record<string, any>;
      return !!(config && (config.access_token || config.refresh_token));
    });
    const connectedCalendar = accounts.some(a => {
      if (a.integration.name !== "googlecalendar") return false;
      const config = a.config as Record<string, any>;
      return !!(config && (config.access_token || config.refresh_token));
    });
    
    return {
      gmail: connectedGmail,
      calendar: connectedCalendar,
      connected: connectedGmail && connectedCalendar
    };
  } catch (err) {
    console.error("Error fetching Corsair connection status:", err);
    return {
      gmail: false,
      calendar: false,
      connected: false
    };
  }
}
