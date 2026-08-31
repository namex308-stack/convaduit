# Paymob migration report

Kashier checkout and webhooks are removed. Paid plans now start from a server-side Paymob session and activate only after a verified processed callback.

## Kashier files removed

| Path | Role |
|---|---|
| `src/lib/kashier.ts` | Checkout URL, HMAC, payload parsers |
| `src/lib/kashier.test.ts` | Kashier unit tests |
| `src/lib/kashier/methods.ts` | UI method → Kashier `allowedMethods` |
| `src/lib/kashier/payment-methods.ts` | Checkout method picker catalog |
| `src/app/api/webhook/kashier/route.ts` | HMAC webhook + redirect |
| `src/app/api/webhooks/kashier/route.ts` | Plural-path alias |
| `scripts/verify-kashier-p0.mjs` | Local Kashier env/HMAC script |
| `docs/kashier-payment-testing-checklist.md` | Kashier QA checklist |

No Kashier npm package was present; nothing to uninstall.

## Paymob files added / modified

### Added

| Path | Role |
|---|---|
| `src/lib/paymob.ts` | Server checkout: auth token → order → payment key → iframe URL |
| `src/lib/paymob/hmac.ts` | SHA-512 processed-callback HMAC |
| `src/lib/paymob/verify.ts` | HMAC + success flags + amount + currency + merchant order id |
| `src/lib/paymob/order-id.ts` | `sp-{plan}-{period}-{uuid}-{ts}` (legacy colon form still parsed) |
| `src/lib/paymob/methods.ts` | Checkout method ids → Paymob integration id |
| `src/lib/paymob/payment-methods.ts` | Same picker catalog (ids, icons, classes) |
| `src/lib/paymob.test.ts` | HMAC, success/fail, amount, currency, env gate, checkout URL |
| `src/app/api/webhook/paymob/route.ts` | POST webhook (activate) + GET redirect (never activate) |
| `src/app/api/webhooks/paymob/route.ts` | Plural-path alias |
| `src/app/api/webhook/paymob/route.test.ts` | Success, fail, HMAC, amount mismatch, duplicate, GET no-activate |
| `src/app/api/checkout/route.test.ts` | Client amount ignored; server uses `PLAN_PRICES` |

### Modified (payment only)

| Path | Change |
|---|---|
| `src/app/api/checkout/route.ts` | Paymob session; amount from `getCheckoutPrice` only |
| `src/lib/billing/activate-subscription.ts` | New `billing_events.provider` = `paymob`. Column `kashier_subscription_id` unchanged |
| `src/lib/env.ts` | Service key `paymob` + `PAYMOB_*` static env reads |
| `src/app/api/route.ts` | Catalog strings |
| `src/app/checkout/page.tsx` | Import retarget only (same layout and method ids) |
| `src/lib/locale/messages/ar.ts` | Checkout trust strings only (`checkout.*`, `pricing.secureCheckout`, `pricing.checkoutDemo`) |
| `src/lib/billing/plans.ts` | Comments only. Prices unchanged (399 / 3990 / 999 / 9990 EGP) |
| `src/lib/billing/upgrade-flow.ts` | Comment only |
| `.env.example` | Paymob variable names, no secrets |
| `README.md` | Env / stack names |

### Intentionally unchanged

- Auth, onboarding, audit engine, Gemini, Firecrawl
- Pricing amounts and plan cards
- SEO metadata, `llms.txt`, structured data, public FAQ / landing copy
- Supabase schema and historical rows
- `subscriptions.kashier_subscription_id` column name

Public marketing copy on FAQ, landing pricing, contact, terms, refund policy, and pricing layout meta still says “Kashier” because those are website/SEO surfaces and were left frozen. Checkout (the payment UI) now says Paymob.

## Environment variables required in Vercel

Set on **Production** (and Preview if you test payments there). Do not commit values.

| Name | Required | Notes |
|---|---|---|
| `PAYMOB_API_KEY` | Yes | Accept API key |
| `PAYMOB_INTEGRATION_ID` | Yes | Default payment integration id |
| `PAYMOB_IFRAME_ID` | Yes | Hosted iframe id |
| `PAYMOB_HMAC_SECRET` | Yes | Processed-callback HMAC secret |
| `PAYMOB_MODE` | Yes in production | `test` or `live` (must match dashboard keys) |

Optional (each falls back to `PAYMOB_INTEGRATION_ID`):

- `PAYMOB_INTEGRATION_CARD_ID`
- `PAYMOB_INTEGRATION_WALLET_ID`
- `PAYMOB_INTEGRATION_INSTAPAY_ID`
- `PAYMOB_INTEGRATION_BANK_ID`
- `PAYMOB_INTEGRATION_KIOSK_ID`

Remove unused Kashier vars from Vercel when convenient (`KASHIER_MERCHANT_ID`, `KASHIER_API_KEY`, `KASHIER_SECRET_KEY`, `KASHIER_WEBHOOK_SECRET`, `KASHIER_MODE`, `NEXT_PUBLIC_KASHIER_MERCHANT_ID`). Leaving them set does not affect the new code path.

Also required for checkout in production (unchanged): `NEXT_PUBLIC_APP_URL` must be public HTTPS (e.g. `https://www.convaudit.com`).

## Webhook URL

Configure Paymob **Transaction processed callback** to:

```
https://www.convaudit.com/api/webhook/paymob
```

Alias (same handler):

```
https://www.convaudit.com/api/webhooks/paymob
```

Paymob appends `?hmac=…`. The handler:

1. Verifies SHA-512 HMAC over the documented field concatenation
2. Requires `success === true`, not pending / voided / refunded, `error_occured === false`
3. Requires `currency === EGP`
4. Requires `amount_cents === getCheckoutPrice(plan, period) * 100`
5. Requires `merchant_order_id` to parse to that plan / period / user
6. Then calls existing `activateSubscription` (idempotent on the payment reference)

`GET` on the same path is a browser redirect only. Query params never activate a plan.

## Database changes

**None.** No migration. No updates or deletes of historical Kashier rows.

| Item | Behavior |
|---|---|
| `subscriptions.kashier_subscription_id` | Kept. New Paymob `merchant_order_id` is stored here |
| `billing_events.provider` | Historical rows stay `kashier`. New events insert `paymob` (`text`, no check constraint) |
| `plan_catalog` / prices | Untouched |
| Idempotency | Lookup by `kashier_subscription_id` = order id. Duplicate webhook → `alreadyProcessed: true`, HTTP 200 |

## Activation rules (server)

A subscription is activated only when all of the following pass on **POST**:

- HMAC
- Transaction success (not pending / voided / refunded / error)
- Amount matches server `PLAN_PRICES` (cents)
- Currency is `EGP`
- Payment reference (`merchant_order_id`) parses and matches that plan/period

Checkout never reads a client `amount`. Extra body fields are stripped by Zod; price always comes from `getCheckoutPrice`.

Demo auto-activation still exists only when Paymob is unset **and** `NODE_ENV !== "production"` (development, or `PAYMOB_MODE=test` in non-production). Production with missing keys returns **503**.

## Test and build results

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — **93 files, 538 tests** |
| `npm run build` | PASS — routes include `/api/webhook/paymob` and `/api/webhooks/paymob`; Kashier routes gone |

Covered payment cases:

- Successful HMAC-verified payment → activate
- Failed / pending payment → no activate
- Invalid HMAC → 401
- Amount mismatch → 422, no activate
- Duplicate webhook → 200, `alreadyProcessed`
- Client-sent `amount: 1` on checkout → server still charges 399 EGP Pro monthly

## UI

Checkout layout, method ids (`credit_card`, `wallet`, `instapay`, `bank_installments`, `basata`, `qr_code`), icons, and classes are unchanged. Checkout trust copy now names Paymob. Pricing page design and amounts are unchanged.

## Final status

| Goal | Status |
|---|---|
| Kashier = Removed (code / env / webhooks) | Done |
| Paymob = Integrated (server-side) | Done |
| Webhook = HMAC verified | Done |
| Subscriptions = Working (same entitlements) | Done |
| Tests = PASS | Done |
| Build = PASS | Done |
| UI = Unchanged (layout) | Done |
| Backend unrelated to billing = Unchanged | Done |
