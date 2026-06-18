import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db/prisma";
import { ensureCorsairTenantProvisioned } from "./corsair/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            image: user.image,
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
          },
        });
        
        // Auto-provision Corsair tenant for the user
        await ensureCorsairTenantProvisioned(user.email);
        
        return true;
      } catch (err) {
        console.error("Error upserting user in db during sign-in:", err);
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || (token.id as string) || "";
      }
      return session;
    },
  },
});
