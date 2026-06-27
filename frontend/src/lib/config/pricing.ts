export const PRIVATE_SESSION_PRICE_CENTS = 5000;

export function formatPriceEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
