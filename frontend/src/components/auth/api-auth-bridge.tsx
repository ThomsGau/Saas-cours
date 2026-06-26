"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";

import { registerTokenResolver } from "@/lib/api/token-store";

export function ApiAuthBridge() {
  useEffect(() => {
    registerTokenResolver(async () => {
      const session = await getSession();
      return session?.accessToken ?? null;
    });
  }, []);

  return null;
}
