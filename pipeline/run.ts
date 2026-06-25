#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { runLeanPipeline } from "./lean-pipeline.js";
import { runPipeline } from "./pipeline.js";
import { getAnthropicModel } from "./lib/config.js";

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
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

function parseArgs(argv: string[]): {
  topic?: string;
  category?: string;
  seriesId?: string;
  resume?: boolean;
  lean?: boolean;
} {
  const result: {
    topic?: string;
    category?: string;
    seriesId?: string;
    resume?: boolean;
    lean?: boolean;
  } = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--topic" && argv[i + 1]) {
      result.topic = argv[++i];
    } else if (arg === "--category" && argv[i + 1]) {
      result.category = argv[++i];
    } else if (arg === "--series-id" && argv[i + 1]) {
      result.seriesId = argv[++i];
    } else if (arg === "--resume") {
      result.resume = true;
    } else if (arg === "--lean") {
      result.lean = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
Toonlora content pipeline

Usage:
  npx tsx pipeline/run.ts --topic "WeWork" --category "rise_and_fall" --lean
  npx tsx pipeline/run.ts --series-id <uuid> --resume --lean

Options:
  --topic       Story topic / series title (required for new runs)
  --category    Category slug e.g. rise_and_fall, founder_stories
  --series-id   Resume an existing series
  --resume      Skip steps already marked completed in pipeline_runs
  --lean        Fast preview: 1 web search, 1 panel, image

Requires: ANTHROPIC_API_KEY, OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY
`);
}

async function main(): Promise<void> {
  const root = resolve(process.cwd());
  loadEnvFile(resolve(root, ".env.local"));
  loadEnvFile(resolve(root, ".env"));

  const model = getAnthropicModel();
  process.env.PIPELINE_ANTHROPIC_MODEL = model;
  process.env.ANTHROPIC_MODEL = model;

  const args = parseArgs(process.argv.slice(2));

  if (!args.seriesId && !args.topic) {
    printHelp();
    process.exit(1);
  }

  if (!args.category && !args.seriesId) {
    args.category = "business";
  }

  try {
    const runOptions = {
      topic: args.topic ?? "Untitled",
      category: args.category ?? "business",
      seriesId: args.seriesId,
      resume: args.resume ?? Boolean(args.seriesId),
    };

    const { seriesId } = args.lean
      ? await runLeanPipeline(runOptions)
      : await runPipeline(runOptions);
    console.log(`Series ID: ${seriesId}`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

void main();
