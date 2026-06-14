const SESSION_KEY = "toonlora-session-id";

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

/** Client-side anonymous session ID (until Supabase Auth) */
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateSessionId();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function sessionHeaders(): HeadersInit {
  return { "X-Session-Id": getSessionId() };
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...sessionHeaders(),
      ...options.headers,
    },
  });
}
