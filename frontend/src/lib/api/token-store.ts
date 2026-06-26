type TokenResolver = () => string | null | Promise<string | null>;

let inMemoryToken: string | null = null;
let tokenResolver: TokenResolver | null = null;

/**
 * Stocke le JWT en mémoire (fallback client).
 * Sera complété par NextAuth à l'étape 3 via registerTokenResolver.
 */
export function setAccessToken(token: string | null): void {
  inMemoryToken = token;
}

export function clearAccessToken(): void {
  inMemoryToken = null;
}

/**
 * Permet à NextAuth (étape 3) de fournir le token depuis la session.
 */
export function registerTokenResolver(resolver: TokenResolver): void {
  tokenResolver = resolver;
}

export async function getAccessToken(): Promise<string | null> {
  if (tokenResolver) {
    const resolved = await tokenResolver();
    if (resolved) {
      return resolved;
    }
  }

  return inMemoryToken;
}
