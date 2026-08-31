/** Checkout UI identifiers — same ids as the previous method picker. */
export type PaymobPaymentMethodId =
  | "credit_card"
  | "instapay"
  | "basata"
  | "bank_installments"
  | "wallet"
  | "qr_code";

const METHOD_IDS = new Set<string>([
  "credit_card",
  "instapay",
  "basata",
  "bank_installments",
  "wallet",
  "qr_code",
]);

export function isPaymobPaymentMethodId(value: string): value is PaymobPaymentMethodId {
  return METHOD_IDS.has(value);
}

/**
 * Map a checkout method to a Paymob integration id.
 * Optional per-method env vars fall back to PAYMOB_INTEGRATION_ID.
 */
export function getPaymobIntegrationId(methodId?: PaymobPaymentMethodId): number | null {
  const fallbackRaw = Number.parseInt(process.env.PAYMOB_INTEGRATION_ID?.trim() ?? "", 10);
  const fallback =
    Number.isFinite(fallbackRaw) && fallbackRaw > 0 ? fallbackRaw : null;
  const byMethod: Record<PaymobPaymentMethodId, string | undefined> = {
    credit_card: process.env.PAYMOB_INTEGRATION_CARD_ID,
    wallet: process.env.PAYMOB_INTEGRATION_WALLET_ID,
    instapay: process.env.PAYMOB_INTEGRATION_INSTAPAY_ID,
    bank_installments: process.env.PAYMOB_INTEGRATION_BANK_ID,
    basata: process.env.PAYMOB_INTEGRATION_KIOSK_ID,
    qr_code: process.env.PAYMOB_INTEGRATION_KIOSK_ID,
  };
  const raw = methodId ? byMethod[methodId]?.trim() : undefined;
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}
