import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONTACT_EMAIL } from "@/lib/seo/contact";
import {
  EMAIL_BRAND_ORANGE,
  renderMasterEmailHtml,
  sendMasterTransactionalEmail,
} from "./master-template";

describe("ConvAudit master email template", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.convaudit.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders header, variables, CTA, and footer for transactional mail", () => {
    const html = renderMasterEmailHtml({
      first_name: "سارة",
      title: "اكتمل تحليل متجرك",
      message: "التقرير جاهز للمراجعة.",
      action_text: "عرض التقرير",
      action_url: "https://www.convaudit.com/dashboard",
    });

    expect(html).toContain('dir="rtl"');
    expect(html).toContain("ConvAudit");
    expect(html).toContain("مرحباً سارة");
    expect(html).toContain("اكتمل تحليل متجرك");
    expect(html).toContain("التقرير جاهز للمراجعة.");
    expect(html).toContain("عرض التقرير");
    expect(html).toContain("https://www.convaudit.com/dashboard");
    expect(html).toContain(EMAIL_BRAND_ORANGE);
    expect(html).toContain("/apple-icon");
    expect(html).toContain("AI-powered Ecommerce Audit &amp; Visibility Platform");
    expect(html).toContain("https://www.convaudit.com");
    expect(html).toContain("Support");
    expect(html).toContain("Privacy Policy");
    expect(html).toContain("Terms");
    expect(html).toContain("/contact");
    expect(html).toContain("/privacy");
    expect(html).toContain("/terms");
    expect(html).toContain(CONTACT_EMAIL);
    expect(html).not.toMatch(/StorePulse/);
    expect(html).not.toMatch(/<script/i);
  });

  it("omits greeting and CTA when those variables are empty", () => {
    const html = renderMasterEmailHtml({
      title: "تنبيه مهم",
      message: "حدث تغيير على متجرك.",
    });

    expect(html).not.toContain("مرحباً");
    expect(html).not.toContain("padding:14px 28px");
    expect(html).toContain("تنبيه مهم");
    expect(html).toContain("حدث تغيير على متجرك.");
    expect(html).toContain("Privacy Policy");
  });

  it("escapes HTML in all template variables", () => {
    const html = renderMasterEmailHtml({
      first_name: "<img src=x>",
      title: "Hello <script>alert(1)</script>",
      message: 'click "here" & go',
      action_text: "<b>Go</b>",
      action_url: "https://www.convaudit.com/?q=\"xss\"",
    });

    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("Hello &lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("&lt;img src=x&gt;");
    expect(html).toContain("&lt;b&gt;Go&lt;/b&gt;");
    expect(html).toContain("click &quot;here&quot; &amp; go");
  });

  it("sends rendered HTML through the existing Resend client", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "msg_master" }),
      text: async () => "",
    });

    const result = await sendMasterTransactionalEmail(
      {
        to: "owner@example.com",
        first_name: "Ali",
        title: "Welcome to ConvAudit",
        message: "Your workspace is ready.",
        action_text: "Open dashboard",
        action_url: "https://www.convaudit.com/dashboard",
      },
      {
        RESEND_API_KEY: "re_test",
        RESEND_FROM_EMAIL: "ConvAudit <alihashem@convaudit.com>",
        NEXT_PUBLIC_APP_URL: "https://www.convaudit.com",
      },
      fetchImpl as unknown as typeof fetch
    );

    expect(result).toEqual({ ok: true, providerId: "msg_master" });
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      from: string;
      html: string;
      subject: string;
    };
    expect(body.from).toBe("ConvAudit <alihashem@convaudit.com>");
    expect(body.subject).toBe("Welcome to ConvAudit");
    expect(body.html).toContain("Welcome to ConvAudit");
    expect(body.html).toContain("مرحباً Ali");
  });
});
