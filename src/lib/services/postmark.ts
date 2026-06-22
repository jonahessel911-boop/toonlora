export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  tag?: string;
  bcc?: string;
}

export interface PostmarkSendResult {
  messageId: string;
  to: string;
}

export function isPostmarkConfigured(): boolean {
  return Boolean(process.env.POSTMARK_SERVER_TOKEN?.trim());
}

export function getPostmarkFrom(): string {
  const email =
    process.env.POSTMARK_FROM_EMAIL?.trim() || "platform@toonlora.com";
  const name = process.env.POSTMARK_FROM_NAME?.trim() || "Toonlora";
  return `${name} <${email}>`;
}

export async function sendPostmarkEmail(
  options: SendEmailOptions
): Promise<PostmarkSendResult> {
  const token = process.env.POSTMARK_SERVER_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "POSTMARK_SERVER_TOKEN is not configured. Add it to your environment variables."
    );
  }

  const to = options.to.trim();
  if (!to) {
    throw new Error("Recipient email is required");
  }

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": token,
    },
    body: JSON.stringify({
      From: getPostmarkFrom(),
      To: to,
      ...(options.bcc?.trim()
        ? { Bcc: options.bcc.trim() }
        : {}),
      Subject: options.subject,
      HtmlBody: options.htmlBody,
      TextBody: options.textBody ?? stripHtml(options.htmlBody),
      MessageStream: "outbound",
      Tag: options.tag,
    }),
  });

  const data = (await response.json()) as {
    MessageID?: string;
    Message?: string;
    ErrorCode?: number;
  };

  if (!response.ok) {
    throw new Error(
      data.Message ?? `Postmark error (${response.status})`
    );
  }

  return {
    messageId: data.MessageID ?? "",
    to,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
