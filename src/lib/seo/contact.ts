/** Official ConvAudit contact email (contact page, mailto links, JSON-LD). */

export const CONTACT_EMAIL = "alihashem@convaudit.com";

export function contactMailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
