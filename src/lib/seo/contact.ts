/** Official ConvAudit contact email (contact page, mailto links, JSON-LD). */

export const CONTACT_EMAIL = "alihashem@convaudit.com";

/**
 * Official WhatsApp number (Egypt local format as provided for display).
 * E.164 for wa.me / tel links: +201515321037
 */
export const CONTACT_WHATSAPP_DISPLAY = "01515321037";
export const CONTACT_WHATSAPP_E164 = "201515321037";

export function contactMailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/** WhatsApp click-to-chat URL (optional prefilled message). */
export function contactWhatsAppUrl(text?: string): string {
  const base = `https://wa.me/${CONTACT_WHATSAPP_E164}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}

export function contactTelHref(): string {
  return `tel:+${CONTACT_WHATSAPP_E164}`;
}
