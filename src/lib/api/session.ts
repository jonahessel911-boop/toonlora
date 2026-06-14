export function getSessionFromRequest(request: Request): string {
  return request.headers.get("X-Session-Id")?.trim() || "anonymous";
}
