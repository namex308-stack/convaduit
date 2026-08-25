import { CONTACT_EMAIL } from "@/lib/seo/contact";
import { ROUTES } from "@/lib/routes";
import { absoluteUrl, PRODUCTION_CANONICAL_ORIGIN } from "@/lib/site-url";
import { sendTransactionalEmail, type SendEmailResult } from "./resend";

/** Brand fill from the ConvAudit logo (email-safe solid; Outlook ignores gradients). */
export const EMAIL_BRAND_ORANGE = "#FF6600";
export const EMAIL_BRAND_ORANGE_DARK = "#cc5200";

export type MasterEmailVars = {
  first_name?: string | null;
  title: string;
  message?: string | null;
  action_text?: string | null;
  action_url?: string | null;
  /**
   * Optional extra HTML already escaped by the caller (weekly report tables).
   * Never pass unsanitized user HTML.
   */
  extraHtml?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function nl2br(escaped: string): string {
  return escaped.replace(/\r\n|\n|\r/g, "<br />");
}

/**
 * ConvAudit master layout for every Resend transactional email.
 * Table + inline CSS only — Gmail / Outlook / Apple Mail safe. No JS.
 */
export function renderMasterEmailHtml(vars: MasterEmailVars): string {
  const site = absoluteUrl("/");
  const logoSrc = escapeAttr(absoluteUrl("/apple-icon"));
  const supportUrl = escapeAttr(absoluteUrl(ROUTES.contact));
  const privacyUrl = escapeAttr(absoluteUrl(ROUTES.privacy));
  const termsUrl = escapeAttr(absoluteUrl(ROUTES.terms));
  const supportMailto = escapeAttr(`mailto:${CONTACT_EMAIL}`);

  const firstName = vars.first_name?.trim() ?? "";
  const title = escapeHtml(vars.title.trim() || "ConvAudit");
  const message = vars.message?.trim() ?? "";
  const actionText = vars.action_text?.trim() ?? "";
  const actionUrl = vars.action_url?.trim() ?? "";
  const extraHtml = vars.extraHtml?.trim() ?? "";

  const greeting = firstName
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155">مرحباً ${escapeHtml(firstName)}،</p>`
    : "";

  const messageBlock = message
    ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#334155">${nl2br(escapeHtml(message))}</p>`
    : "";

  const ctaBlock =
    actionText && actionUrl
      ? `<table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:28px auto 8px">
            <tr>
              <td bgcolor="${EMAIL_BRAND_ORANGE}" style="border-radius:8px;background-color:${EMAIL_BRAND_ORANGE}">
                <a href="${escapeAttr(actionUrl)}" style="display:inline-block;padding:14px 28px;font-family:Tahoma,Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">${escapeHtml(actionText)}</a>
              </td>
            </tr>
          </table>`
      : "";

  const extraBlock = extraHtml
    ? `<div style="margin:8px 0 16px">${extraHtml}</div>`
    : "";

  const preheader = escapeHtml(vars.title.trim() || "ConvAudit");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Tahoma,Arial,Helvetica,sans-serif;color:#0f172a;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;width:100%">
    <tr>
      <td align="center" style="padding:24px 12px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%">
          <tr>
            <td style="padding:0 0 16px;text-align:center">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td valign="middle" style="padding:0 8px 0 0">
                    <img src="${logoSrc}" width="36" height="36" alt="ConvAudit" style="display:block;border:0;outline:none;text-decoration:none;border-radius:8px" />
                  </td>
                  <td valign="middle" style="font-family:Tahoma,Arial,sans-serif;font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.02em">ConvAudit</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td bgcolor="${EMAIL_BRAND_ORANGE}" height="4" style="background-color:${EMAIL_BRAND_ORANGE};font-size:0;line-height:0;height:4px">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:28px 24px 32px">
                    ${greeting}
                    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.35;color:#0f172a;font-weight:800">${title}</h1>
                    ${messageBlock}
                    ${extraBlock}
                    ${ctaBlock}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 8px;text-align:center">
              <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#0f172a">ConvAudit</p>
              <p style="margin:0 0 12px;font-size:12px;line-height:1.5;color:#64748b">AI-powered Ecommerce Audit &amp; Visibility Platform</p>
              <p style="margin:0 0 12px;font-size:12px">
                <a href="${escapeAttr(site)}" style="color:${EMAIL_BRAND_ORANGE_DARK};text-decoration:none">${PRODUCTION_CANONICAL_ORIGIN}</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.8;color:#64748b">
                <a href="${supportUrl}" style="color:#64748b;text-decoration:underline">Support</a>
                &nbsp;·&nbsp;
                <a href="${supportMailto}" style="color:#64748b;text-decoration:underline">${escapeHtml(CONTACT_EMAIL)}</a>
                &nbsp;·&nbsp;
                <a href="${privacyUrl}" style="color:#64748b;text-decoration:underline">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="${termsUrl}" style="color:#64748b;text-decoration:underline">Terms</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type SendMasterEmailInput = MasterEmailVars & {
  to: string;
  subject?: string;
  idempotencyKey?: string;
};

/**
 * Render the ConvAudit master template and send it through the existing Resend client.
 */
export async function sendMasterTransactionalEmail(
  input: SendMasterEmailInput,
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>,
  fetchImpl?: typeof fetch
): Promise<SendEmailResult> {
  const html = renderMasterEmailHtml({
    first_name: input.first_name,
    title: input.title,
    message: input.message,
    action_text: input.action_text,
    action_url: input.action_url,
    extraHtml: input.extraHtml,
  });

  return sendTransactionalEmail(
    {
      to: input.to,
      subject: input.subject?.trim() || input.title.trim(),
      html,
      idempotencyKey: input.idempotencyKey,
    },
    env,
    fetchImpl
  );
}
