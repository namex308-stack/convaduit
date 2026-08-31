import { createHmac, timingSafeEqual } from "node:crypto";

/** Paymob transaction processed HMAC field order (SHA-512). */
export const TRANSACTION_HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order.id",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
] as const;

function hmacString(value: unknown): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value == null) return "";
  return String(value);
}

function readPath(source: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = source;
  for (const part of parts) {
    if (current == null || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function concatenateTransactionHmacFields(obj: Record<string, unknown>): string {
  return TRANSACTION_HMAC_FIELDS.map((field) => hmacString(readPath(obj, field))).join("");
}

/** Flattened GET redirect keys used by Paymob's transaction response callback. */
export function concatenateRedirectHmacFields(query: Record<string, string>): string {
  const values = [
    query.amount_cents,
    query.created_at,
    query.currency,
    query.error_occured,
    query.has_parent_transaction,
    query.id,
    query.integration_id,
    query.is_3d_secure,
    query.is_auth,
    query.is_capture,
    query.is_refunded,
    query.is_standalone_payment,
    query.is_voided,
    query.order_id ?? query.order,
    query.owner,
    query.pending,
    query.source_data_pan,
    query.source_data_sub_type,
    query.source_data_type,
    query.success,
  ];
  return values.map((v) => hmacString(v ?? "")).join("");
}

export function computePaymobHmac(secret: string, concatenated: string): string {
  return createHmac("sha512", secret).update(concatenated).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  const leftBuf = Buffer.from(left, "utf8");
  const rightBuf = Buffer.from(right, "utf8");
  if (leftBuf.length !== rightBuf.length) return false;
  return timingSafeEqual(leftBuf, rightBuf);
}

export function getPaymobHmacSecret(): string | null {
  return process.env.PAYMOB_HMAC_SECRET?.trim() || null;
}

export function verifyTransactionProcessedHmac(
  obj: Record<string, unknown>,
  receivedHmac: string,
  secret = getPaymobHmacSecret()
): boolean {
  if (!secret || !receivedHmac) return false;
  const expected = computePaymobHmac(secret, concatenateTransactionHmacFields(obj));
  return safeEqualHex(expected, receivedHmac);
}

export function verifyRedirectHmac(
  query: Record<string, string>,
  receivedHmac: string,
  secret = getPaymobHmacSecret()
): boolean {
  if (!secret || !receivedHmac) return false;
  const expected = computePaymobHmac(secret, concatenateRedirectHmacFields(query));
  return safeEqualHex(expected, receivedHmac);
}
