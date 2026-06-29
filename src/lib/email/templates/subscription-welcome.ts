import { EMAIL_BRAND } from "@/lib/email/brand";
import { primaryButton, wrapEmailHtml } from "@/lib/email/layout";

const WELCOME_STORIES = [
  {
    title: "The Biggest Company That Ever Existed",
    genre: "Empires",
    imageUrl: "/images/heroes/voc-empire.png",
    href: "/",
  },
  {
    title: "Steve Jobs: The Comeback",
    genre: "Founder Stories",
    colorStart: "#2F80ED",
    colorEnd: "#0A1628",
    href: "/",
  },
  {
    title: "WeWork: $47B to $8B",
    genre: "Rise & Fall",
    colorStart: "#FF6847",
    colorEnd: "#2A114B",
    href: "/",
  },
  {
    title: "FTX: The $32B Collapse",
    genre: "Heists & Frauds",
    colorStart: "#00B67A",
    colorEnd: "#0E1726",
    href: "/",
  },
] as const;

function storyCard(story: (typeof WELCOME_STORIES)[number]): string {
  const media =
    "imageUrl" in story
      ? `<img src="${EMAIL_BRAND.siteUrl}${story.imageUrl}" alt="" width="100%" style="display:block;width:100%;height:120px;object-fit:cover;border:0;" />`
      : `<div style="height:120px;background:linear-gradient(135deg,${story.colorStart},${story.colorEnd});"></div>`;

  return `
    <td width="50%" style="padding:6px;vertical-align:top;">
      <a href="${EMAIL_BRAND.siteUrl}${story.href}" style="text-decoration:none;display:block;">
        <div style="border-radius:16px;overflow:hidden;border:1px solid ${EMAIL_BRAND.border};">
          ${media}
          <div style="padding:12px;background:#ffffff;">
            <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${EMAIL_BRAND.muted};">${story.genre}</p>
            <p style="margin:4px 0 0;font-size:14px;font-weight:800;color:${EMAIL_BRAND.purpleDark};">${story.title}</p>
          </div>
        </div>
      </a>
    </td>`;
}

function coversHtml(): string {
  const cards = WELCOME_STORIES.map(storyCard);
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0 8px;">
  <tr>${cards.slice(0, 2).join("")}</tr>
  <tr>${cards.slice(2, 4).join("")}</tr>
</table>`;
}

export function buildSubscriptionWelcomeEmail(options: {
  continueUrl: string;
  planName?: string;
}): { subject: string; html: string; text: string } {
  const subject = "Welcome to Toonlora — your membership is active";

  const body = `
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;font-weight:800;color:${EMAIL_BRAND.purpleDark};">
      You're in — welcome to Toonlora
    </h1>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.muted};">
      ${
        options.planName
          ? `Your <strong>${options.planName}</strong> membership is active.`
          : "Your membership is active."
      }
      You now have access to cinematic business stories — founder comebacks, fraud cases, empire builds, and billion-dollar collapses.
    </p>

    <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:${EMAIL_BRAND.purpleDark};">What you need to know</p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.7;color:${EMAIL_BRAND.muted};">
      <li>New chapters drop every week — Entrepreneur members read them 7 days early.</li>
      <li>Read on phone, tablet, or desktop — your progress saves automatically.</li>
      <li>Cancel anytime from your profile. 30-day money-back guarantee applies.</li>
      <li>Sign in on any device with the email and password you just created.</li>
    </ul>

    ${primaryButton(options.continueUrl, "Start reading")}

    <h2 style="margin:28px 0 4px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:${EMAIL_BRAND.muted};">
      Start with these stories
    </h2>
    ${coversHtml()}

    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.muted};">
      Questions? Reply to this email — we're happy to help.
    </p>
  `;

  const html = wrapEmailHtml({
    preheader: "Your Toonlora membership is active. Start reading today.",
    body,
  });

  const text = `Welcome to Toonlora!

Your membership is active. Start reading: ${options.continueUrl}

What you need to know:
- New chapters every week
- Progress saves across devices
- Cancel anytime · 30-day money-back guarantee
- Sign in on any device with your new account`;

  return { subject, html, text };
}
