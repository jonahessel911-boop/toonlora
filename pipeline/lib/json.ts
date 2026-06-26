/** Escape raw newlines/tabs/control chars inside JSON string literals. */
function escapeControlCharsInJsonStrings(json: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    const code = char.charCodeAt(0);

    if (!inString) {
      result += char;
      if (char === '"') inString = true;
      continue;
    }

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      result += char;
      inString = false;
      continue;
    }

    if (code < 0x20) {
      if (char === "\n") result += "\\n";
      else if (char === "\r") result += "\\r";
      else if (char === "\t") result += "\\t";
      else result += `\\u${code.toString(16).padStart(4, "0")}`;
      continue;
    }

    result += char;
  }

  return result;
}

function parseJsonCandidates(candidates: string[]): unknown {
  let lastError: Error | undefined;

  for (const text of candidates) {
    for (const attempt of [
      text,
      escapeControlCharsInJsonStrings(text),
      repairTruncatedJson(text),
      repairTruncatedJson(escapeControlCharsInJsonStrings(text)),
    ]) {
      if (!attempt) continue;
      try {
        return JSON.parse(attempt);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  throw lastError ?? new Error("Model response did not contain valid JSON");
}

/** Close unterminated strings/objects when the model hits max_tokens. */
function repairTruncatedJson(json: string): string | null {
  const trimmed = json.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;

  let result = escapeControlCharsInJsonStrings(trimmed);
  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (let i = 0; i < result.length; i++) {
    const char = result[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") stack.push("}");
    else if (char === "[") stack.push("]");
    else if (char === "}" || char === "]") stack.pop();
  }

  if (inString) result += '"';
  while (stack.length > 0) {
    result += stack.pop();
  }

  return result === trimmed ? null : result;
}

function collectJsonCandidates(raw: string): string[] {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  const candidates = new Set<string>([candidate]);

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) {
    candidates.add(candidate.slice(start, end + 1));
  }

  const arrStart = candidate.indexOf("[");
  const arrEnd = candidate.lastIndexOf("]");
  if (arrStart >= 0 && arrEnd > arrStart) {
    candidates.add(candidate.slice(arrStart, arrEnd + 1));
  }

  return [...candidates];
}

export function parseJsonFromModel<T>(raw: string): T {
  return parseJsonCandidates(collectJsonCandidates(raw)) as T;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
