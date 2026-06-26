import type { DefaultSession } from "next-auth";

import type { Role } from "@/lib/api/types";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      email: string;
      role: Role;
      displayName: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken: string;
    role: Role;
    displayName: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: Role;
    email?: string;
    displayName?: string | null;
  }
}
