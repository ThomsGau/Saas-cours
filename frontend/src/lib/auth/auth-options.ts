import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { API_BASE_URL } from "@/lib/api/config";
import type { AuthResponse, Role, UserProfileResponse } from "@/lib/api/types";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as AuthResponse;

        return {
          id: data.email,
          email: data.email,
          role: data.role,
          displayName: data.displayName,
          accessToken: data.accessToken,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role as Role;
        token.email = user.email ?? undefined;
        token.displayName = user.displayName ?? null;
      }

      if (!token.displayName && token.accessToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${token.accessToken as string}`,
            },
          });

          if (response.ok) {
            const profile = (await response.json()) as UserProfileResponse;
            const trimmedName = profile.displayName?.trim();
            if (trimmedName) {
              token.displayName = trimmedName;
            }
          }
        } catch {
          // Keep session usable if profile refresh fails.
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.email = token.email as string;
      session.user.role = token.role as Role;
      session.user.displayName = (token.displayName as string | null | undefined) ?? null;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
