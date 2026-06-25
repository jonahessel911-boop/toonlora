#!/usr/bin/env node
/**
 * MCP server — control Toonlora story pipeline from Cursor or any MCP client.
 *
 * Tools: queue_story, start_story, resume_story, story_status, list_stories, queue_status
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { loadServerEnv } from "./lib/env.js";
import {
  enqueueStory,
  getQueueStats,
  listQueueJobs,
} from "./lib/pipeline-queue.js";
import { runStoryPipeline } from "./lib/pipeline-runner.js";
import { getStoryStatus, listPipelineStories } from "./lib/pipeline-status.js";

loadServerEnv();

const server = new Server(
  {
    name: "toonlora-pipeline",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TOOLS = [
  {
    name: "queue_story",
    description:
      "Queue a business story topic for autonomous generation. The pipeline worker on the server will pick it up and run research → script → prompts → images.",
    inputSchema: {
      type: "object" as const,
      properties: {
        topic: {
          type: "string",
          description: 'Story topic e.g. "Enzo Ferrari" or "WeWork collapse"',
        },
        category: {
          type: "string",
          enum: ["rise_and_fall", "founder_stories", "business"],
          description: "Story category (default: business)",
        },
        mode: {
          type: "string",
          enum: ["lean", "full"],
          description:
            "lean = 1 preview panel (fast). full = complete bible + all scripts + images.",
        },
        priority: {
          type: "number",
          description: "Higher priority jobs run first (default: 0)",
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "start_story",
    description:
      "Start story generation immediately (blocking). Use queue_story for background production on the server.",
    inputSchema: {
      type: "object" as const,
      properties: {
        topic: { type: "string" },
        category: {
          type: "string",
          enum: ["rise_and_fall", "founder_stories", "business"],
        },
        mode: { type: "string", enum: ["lean", "full"] },
      },
      required: ["topic"],
    },
  },
  {
    name: "resume_story",
    description: "Resume a failed or partial pipeline run for an existing series.",
    inputSchema: {
      type: "object" as const,
      properties: {
        series_id: { type: "string", description: "UUID of the series" },
        mode: { type: "string", enum: ["lean", "full"] },
      },
      required: ["series_id"],
    },
  },
  {
    name: "story_status",
    description: "Get pipeline status for a series by ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        series_id: { type: "string" },
      },
      required: ["series_id"],
    },
  },
  {
    name: "list_stories",
    description: "List recent pipeline series with status and panel counts.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Max results (default: 20)" },
      },
    },
  },
  {
    name: "queue_status",
    description: "Show autonomous job queue stats and recent jobs.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Max recent jobs (default: 10)" },
      },
    },
  },
];

function jsonText(data: unknown): { content: Array<{ type: "text"; text: string }> } {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "queue_story": {
        const input = z
          .object({
            topic: z.string().min(1),
            category: z
              .enum(["rise_and_fall", "founder_stories", "business"])
              .optional(),
            mode: z.enum(["lean", "full"]).optional(),
            priority: z.number().optional(),
          })
          .parse(args);

        const job = await enqueueStory(input);
        return jsonText({
          ok: true,
          message: `Queued "${job.topic}" — worker will process automatically`,
          job,
        });
      }

      case "start_story": {
        const input = z
          .object({
            topic: z.string().min(1),
            category: z
              .enum(["rise_and_fall", "founder_stories", "business"])
              .optional(),
            mode: z.enum(["lean", "full"]).optional(),
          })
          .parse(args);

        const result = await runStoryPipeline(input);
        const status = await getStoryStatus(result.seriesId);
        return jsonText({ ok: true, result, status });
      }

      case "resume_story": {
        const input = z
          .object({
            series_id: z.string().uuid(),
            mode: z.enum(["lean", "full"]).optional(),
          })
          .parse(args);

        const statusBefore = await getStoryStatus(input.series_id);
        if (!statusBefore) {
          throw new Error(`Series not found: ${input.series_id}`);
        }

        const result = await runStoryPipeline({
          topic: statusBefore.title,
          category: statusBefore.category ?? "business",
          mode: input.mode ?? "lean",
          seriesId: input.series_id,
          resume: true,
        });

        const status = await getStoryStatus(result.seriesId);
        return jsonText({ ok: true, result, status });
      }

      case "story_status": {
        const input = z.object({ series_id: z.string().uuid() }).parse(args);
        const status = await getStoryStatus(input.series_id);
        if (!status) throw new Error(`Series not found: ${input.series_id}`);
        return jsonText(status);
      }

      case "list_stories": {
        const input = z.object({ limit: z.number().optional() }).parse(args ?? {});
        const stories = await listPipelineStories(input.limit ?? 20);
        return jsonText({ count: stories.length, stories });
      }

      case "queue_status": {
        const input = z.object({ limit: z.number().optional() }).parse(args ?? {});
        const [stats, jobs] = await Promise.all([
          getQueueStats(),
          listQueueJobs(input.limit ?? 10),
        ]);
        return jsonText({ stats, jobs });
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: false, error: message }) }],
      isError: true,
    };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[toonlora-pipeline-mcp] Ready");
}

void main().catch((err) => {
  console.error("[toonlora-pipeline-mcp] Fatal:", err);
  process.exit(1);
});
