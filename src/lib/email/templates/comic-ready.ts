import { EMAIL_BRAND } from "@/lib/email/brand";
import { primaryButton, wrapEmailHtml } from "@/lib/email/layout";

export function buildComicReadyEmail(options: {
  storyTitle: string;
  storyId: string;
}): { subject: string; html: string; text: string } {
  const editorUrl = `${EMAIL_BRAND.siteUrl}/creator/editor/${options.storyId}`;
  const subject = `Je Lora is klaar — ${options.storyTitle}`;

  const body = `
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;font-weight:800;color:${EMAIL_BRAND.purpleDark};">
      Je Lora is klaar! 🎉
    </h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.muted};">
      <strong style="color:${EMAIL_BRAND.purpleDark};">${options.storyTitle}</strong>
      is gegenereerd. Open de panel editor om je scènes te bekijken en speech bubbles toe te voegen.
    </p>
    ${primaryButton(editorUrl, "Open panel editor")}
    <p style="margin:0;font-size:13px;color:${EMAIL_BRAND.muted};">
      Of ga naar <a href="${EMAIL_BRAND.siteUrl}/creator" style="color:${EMAIL_BRAND.purple};font-weight:700;">Toonlora Studio</a> om verder te werken.
    </p>
  `;

  const html = wrapEmailHtml({
    preheader: `${options.storyTitle} is klaar om te bewerken op Toonlora.`,
    body,
  });

  const text = `Je Lora "${options.storyTitle}" is klaar!\n\nOpen de editor: ${editorUrl}`;

  return { subject, html, text };
}
