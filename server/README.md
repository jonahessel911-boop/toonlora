# Toonlora Pipeline Server

Autonomous story production on your server — controlled via MCP (Cursor) or a background worker.

## Architecture

```
Cursor / MCP client          Server
       │                        │
       ├─ queue_story ─────────►│ pipeline_queue (Supabase)
       ├─ start_story ─────────►│ pipeline runner (direct)
       ├─ story_status ────────►│ status queries
       │                        │
       │                   pipeline-worker.ts (daemon)
       │                        │
       │                        └─► research → story → prompts → images
```

## 1. Database migration

Run migration `021_pipeline_queue.sql` in Supabase.

## 2. Environment

Copy `.env.example` → `.env.local` on the server with:

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `PIPELINE_ANTHROPIC_MODEL=claude-sonnet-4-5`
- `PIPELINE_OWNER_SESSION_ID=pipeline-system`
- `PIPELINE_WORKER_POLL_MS=30000`

## 3. Background worker (autonomous)

On your server, keep the worker running:

```bash
npm run pipeline:worker
```

With **pm2**:

```bash
pm2 start npm --name toonlora-worker -- run pipeline:worker
pm2 save
```

The worker polls `pipeline_queue` every 30s and runs one story at a time.

## 4. MCP server (control from Cursor)

Add to `.cursor/mcp.json` in this repo:

```json
{
  "mcpServers": {
    "toonlora-pipeline": {
      "command": "npx",
      "args": ["tsx", "server/mcp-server.ts"],
      "cwd": "/absolute/path/to/fliptoon"
    }
  }
}
```

Restart Cursor. The agent can then use these tools:

| Tool | What it does |
|------|----------------|
| `queue_story` | Add topic to queue — worker runs it automatically |
| `start_story` | Run pipeline immediately (blocking) |
| `resume_story` | Resume failed/partial series |
| `story_status` | Check progress by series UUID |
| `list_stories` | List recent pipeline series |
| `queue_status` | Queue depth + recent jobs |

### Example prompts in Cursor

- *"Queue 3 stories: Ferrari, WeWork, Theranos — category rise_and_fall"*
- *"What's the queue status?"*
- *"Resume series `<uuid>` in lean mode"*

## 5. Modes

- **lean** (default): research + 1 preview panel + image — fast, good for testing
- **full**: research → bible → architect → script → prompts → images — complete production

## 6. Creator Admin

Stories appear in `/creator-admin` for human QA after generation.
