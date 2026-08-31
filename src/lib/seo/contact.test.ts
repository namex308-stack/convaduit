import { describe, expect, it } from "vitest";
import {
  CONTACT_EMAIL,
  CONTACT_WHATSAPP_DISPLAY,
  CONTACT_WHATSAPP_E164,
  contactMailto,
  contactTelHref,
  contactWhatsAppUrl,
} from "@/lib/seo/contact";

describe("official contact email", () => {
  it("uses the public ConvAudit mailbox", () => {
    expect(CONTACT_EMAIL).toBe("alihashem@convaudit.com");
  });

  it("builds a mailto URL with an encoded subject", () => {
    expect(contactMailto("طلب دعم ConvAudit")).toBe(
      "mailto:alihashem@convaudit.com?subject=%D8%B7%D9%84%D8%A8%20%D8%AF%D8%B9%D9%85%20ConvAudit"
    );
  });
});

describe("official WhatsApp contact", () => {
  it("exposes the local display number and E.164 digits", () => {
    expect(CONTACT_WHATSAPP_DISPLAY).toBe("01515321037");
    expect(CONTACT_WHATSAPP_E164).toBe("201515321037");
  });

  it("builds wa.me and tel links", () => {
    expect(contactWhatsAppUrl()).toBe("https://wa.me/201515321037");
    expect(contactWhatsAppUrl("مرحبا ConvAudit")).toBe(
      "https://wa.me/201515321037?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20ConvAudit"
    );
    expect(contactTelHref()).toBe("tel:+201515321037");
  });
});
