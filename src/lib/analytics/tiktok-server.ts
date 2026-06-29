import { createHash } from "crypto";

export const TIKTOK_EVENTS_API_URL =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";

function getTikTokPixelId(): string {
  return (
    process.env.TIKTOK_PIXEL_ID?.trim() ||
    process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() ||
    ""
  );
}

function getTikTokAccessToken(): string {
  return process.env.TIKTOK_ACCESS_TOKEN?.trim() || "";
}

export function isTikTokEventsApiConfigured(): boolean {
  return Boolean(getTikTokPixelId() && getTikTokAccessToken());
}

export function hashTikTokPii(value: string): string {
  return createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

export type TikTokServerEvent = {
  event: string;
  eventId: string;
  eventTime?: number;
  user?: {
    email?: string | null;
    phone?: string | null;
    externalId?: string | null;
    ttclid?: string | null;
    ttp?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  };
  properties?: {
    value?: number;
    currency?: string;
    contentId?: string;
    contentType?: string;
    contentName?: string;
    contents?: ReturnType<typeof import("@/lib/analytics/tiktok-content").buildTikTokContents>;
  };
  page?: {
    url?: string;
    referrer?: string;
  };
};

function buildUserPayload(user?: TikTokServerEvent["user"]) {
  if (!user) return undefined;

  const payload: Record<string, string> = {};
  if (user.email) payload.email = hashTikTokPii(user.email);
  if (user.phone) payload.phone = hashTikTokPii(user.phone);
  if (user.externalId) payload.external_id = hashTikTokPii(user.externalId);
  if (user.ttclid) payload.ttclid = user.ttclid;
  if (user.ttp) payload.ttp = user.ttp;
  if (user.ip) payload.ip = user.ip;
  if (user.userAgent) payload.user_agent = user.userAgent;

  return Object.keys(payload).length > 0 ? payload : undefined;
}

export async function sendTikTokServerEvent(
  input: TikTokServerEvent
): Promise<boolean> {
  const pixelId = getTikTokPixelId();
  const accessToken = getTikTokAccessToken();
  if (!pixelId || !accessToken) return false;

  const user = buildUserPayload(input.user);
  const properties: Record<string, unknown> = {};
  if (input.properties?.currency) properties.currency = input.properties.currency;
  if (input.properties?.value != null) properties.value = input.properties.value;
  if (input.properties?.contentId) properties.content_id = input.properties.contentId;
  if (input.properties?.contentType) {
    properties.content_type = input.properties.contentType;
  }
  if (input.properties?.contentName) properties.content_name = input.properties.contentName;
  if (input.properties?.contents?.length) {
    properties.contents = input.properties.contents;
  }

  const dataItem: Record<string, unknown> = {
    event: input.event,
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
  };
  if (user) dataItem.user = user;
  if (Object.keys(properties).length > 0) dataItem.properties = properties;
  if (input.page?.url || input.page?.referrer) {
    dataItem.page = {
      ...(input.page.url ? { url: input.page.url } : {}),
      ...(input.page.referrer ? { referrer: input.page.referrer } : {}),
    };
  }

  try {
    const response = await fetch(TIKTOK_EVENTS_API_URL, {
      method: "POST",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_source: "web",
        event_source_id: pixelId,
        data: [dataItem],
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const bodyText = await response.text().catch(() => "");
    if (!response.ok) {
      console.error("[tiktok-events-api]", response.status, bodyText.slice(0, 500));
      return false;
    }

    try {
      const json = JSON.parse(bodyText) as { code?: number; message?: string };
      if (typeof json.code === "number" && json.code !== 0) {
        console.error("[tiktok-events-api] rejected", json);
        return false;
      }
      if (process.env.NODE_ENV !== "production") {
        console.info("[tiktok-events-api] sent", input.event, input.eventId, json);
      }
    } catch {
      /* non-json success body */
    }

    return true;
  } catch (err) {
    console.error("[tiktok-events-api] request failed", err);
    return false;
  }
}
