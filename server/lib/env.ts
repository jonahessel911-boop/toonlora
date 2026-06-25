import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getAnthropicModel } from "../../pipeline/lib/config.js";

const PROJECT_ROOT = resolve(import.meta.dirname, "../..");

export function loadServerEnv(): void {
  for (const file of [".env.local", ".env"]) {
    const filePath = resolve(PROJECT_ROOT, file);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

export function configurePipelineEnv(): void {
  const model = getAnthropicModel();
  process.env.PIPELINE_ANTHROPIC_MODEL = model;
  process.env.ANTHROPIC_MODEL = model;
}

export function getProjectRoot(): string {
  return PROJECT_ROOT;
}
