import { COIN_PACKAGES } from "@/lib/payments/coin-packages";
import { apiFetch } from "@/lib/session";

export async function createCoinCheckout(packageId: string): Promise<string | null> {
  const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return null;

  const res = await apiFetch("/api/stripe/checkout", {
    method: "POST",
    body: JSON.stringify({ packageId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Checkout failed");
  }
  return (data.url as string) ?? null;
}
