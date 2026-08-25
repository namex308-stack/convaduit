import { describe, expect, it } from "vitest";
import { CONTACT_EMAIL, contactMailto } from "@/lib/seo/contact";

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
