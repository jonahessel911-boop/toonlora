import { EMAIL_BRAND, logoUrl } from "@/lib/email/brand";

export function wrapEmailHtml(options: {
  preheader: string;
  body: string;
}): string {
  const { preheader, body } = options;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Toonlora</title>
</head>
<body style="margin:0;padding:0;background-color:#FCFAFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EMAIL_BRAND.purpleDark};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#FCFAFF;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid ${EMAIL_BRAND.border};border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(83,64,255,0.08);">
          <tr>
            <td style="padding:28px 32px 20px;background:linear-gradient(135deg,${EMAIL_BRAND.lavender} 0%,#ffffff 100%);border-bottom:1px solid ${EMAIL_BRAND.border};">
              <a href="${EMAIL_BRAND.siteUrl}" style="text-decoration:none;">
                <img src="${logoUrl()}" alt="Toonlora" width="180" style="display:block;height:auto;border:0;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:${EMAIL_BRAND.lavender};border-top:1px solid ${EMAIL_BRAND.border};text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:${EMAIL_BRAND.muted};">
                © ${year} Toonlora · Maak je eigen verticale webtoon
              </p>
              <p style="margin:0;font-size:12px;">
                <a href="${EMAIL_BRAND.siteUrl}" style="color:${EMAIL_BRAND.purple};text-decoration:none;font-weight:700;">toonlora.com</a>
                &nbsp;·&nbsp;
                <a href="${EMAIL_BRAND.siteUrl}/creator" style="color:${EMAIL_BRAND.purple};text-decoration:none;font-weight:700;">Studio</a>
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

export function primaryButton(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
  <tr>
    <td style="border-radius:16px;background:${EMAIL_BRAND.coral};">
      <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:16px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}
