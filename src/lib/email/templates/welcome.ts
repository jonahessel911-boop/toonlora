import {
  EMAIL_BRAND,
  FEATURED_STORIES,
  TOP_CATEGORIES,
} from "@/lib/email/brand";
import { primaryButton, wrapEmailHtml } from "@/lib/email/layout";

function storyCardsHtml(): string {
  const cards = FEATURED_STORIES.map(
    (story) => `
    <td width="50%" style="padding:6px;vertical-align:top;">
      <a href="${EMAIL_BRAND.siteUrl}${story.href}" style="text-decoration:none;display:block;">
        <div style="border-radius:16px;overflow:hidden;border:1px solid ${EMAIL_BRAND.border};">
          <div style="height:88px;background:linear-gradient(135deg,${story.colorStart},${story.colorEnd});padding:12px;display:flex;align-items:flex-end;">
            <span style="display:inline-block;background:rgba(255,255,255,0.92);color:${EMAIL_BRAND.purple};font-size:10px;font-weight:700;padding:4px 8px;border-radius:999px;">${story.genre}</span>
          </div>
          <div style="padding:12px;background:#ffffff;">
            <p style="margin:0;font-size:14px;font-weight:800;color:${EMAIL_BRAND.purpleDark};">${story.title}</p>
            <p style="margin:4px 0 0;font-size:11px;color:${EMAIL_BRAND.muted};">${story.views}</p>
          </div>
        </div>
      </a>
    </td>`
  );

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0 8px;">
  <tr>${cards.slice(0, 2).join("")}</tr>
  <tr>${cards.slice(2, 4).join("")}</tr>
</table>`;
}

function categoriesHtml(): string {
  const chips = TOP_CATEGORIES.map(
    (cat) =>
      `<span style="display:inline-block;margin:4px 6px 4px 0;padding:8px 14px;background:${EMAIL_BRAND.lavender};color:${EMAIL_BRAND.purple};font-size:12px;font-weight:700;border-radius:999px;border:1px solid ${EMAIL_BRAND.border};">${cat}</span>`
  ).join("");

  return `<div style="margin:8px 0 0;">${chips}</div>`;
}

export function buildWelcomeEmail(): { subject: string; html: string; text: string } {
  const subject = "Welkom bij Toonlora! 🎨";

  const body = `
    <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;font-weight:800;color:${EMAIL_BRAND.purpleDark};">
      Welkom bij Toonlora!
    </h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.muted};">
      Je bent klaar om je eigen verticale webtoon te maken — met AI-personages,
      panelen en een studio die simpel blijft.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.purpleDark};">
      Ontdek populaire verhalen, kies een categorie en begin vandaag nog in de Studio.
    </p>

    ${primaryButton(`${EMAIL_BRAND.siteUrl}/creator`, "Open Toonlora Studio")}

    <h2 style="margin:28px 0 4px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${EMAIL_BRAND.muted};">
      Top stories
    </h2>
    ${storyCardsHtml()}

    <h2 style="margin:24px 0 4px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${EMAIL_BRAND.muted};">
      Top categorieën
    </h2>
    ${categoriesHtml()}

    <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.muted};">
      Veel plezier met lezen en creëren — we mailen je wanneer je Lora klaar is om te bewerken.
    </p>
  `;

  const html = wrapEmailHtml({
    preheader: "Welkom bij Toonlora — maak je eigen webtoon met AI.",
    body,
  });

  const text = `Welkom bij Toonlora!

Je bent klaar om je eigen verticale webtoon te maken.

Top stories: ${FEATURED_STORIES.map((s) => s.title).join(", ")}
Top categorieën: ${TOP_CATEGORIES.join(", ")}

Open de Studio: ${EMAIL_BRAND.siteUrl}/creator`;

  return { subject, html, text };
}
