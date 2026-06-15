# Supabase setup — Toonlora

## 1. Create project

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy **Project URL** and **service_role key** (Settings → API)

## 2. Run migration

Open **SQL Editor** in Supabase and paste the contents of:

Run all migration files in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_profiles.sql
supabase/migrations/003_analytics.sql
supabase/migrations/004_episode_comments.sql
supabase/migrations/005_publishing.sql
supabase/migrations/006_comic_art_storage.sql
```

This creates:

| Table | Purpose |
|-------|---------|
| `user_sessions` | Anonymous credits (until Auth) |
| `profiles` | Registered name + email linked to session |
| `series` | Story Bible + metadata + **publish fields** (`source`, `status`, `published_at`) |
| `episodes` | Scripts, panels, overlays per episode |
| `reading_progress` | Panel progress + episode completion |
| `platform_sessions` | Time on platform per visit |
| `login_events` | Login timestamps for retention metrics |
| `episode_comments` | User comments per episode |

## 3. Configure env

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_USE_DATABASE=true

OPENAI_API_KEY=sk-...
```

> **Important:** `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in client code.

## 4. Test the connection

With the dev server running, open:

```
http://localhost:3000/api/health/db
```

You should see `"ok": true` when everything is wired up. If not, the JSON lists what's missing (env vars, migrations, bad URL).

Or from terminal:

```bash
curl -s http://localhost:3000/api/health/db | python3 -m json.tool
```

## 6. Restart dev server

```bash
npm run dev
```

## Behaviour

| `NEXT_PUBLIC_USE_DATABASE` | Storage |
|---------------------------|---------|
| `false` (default) | localStorage (MVP) |
| `true` | Supabase via `/api/*` routes |

Share links (`/share/[id]`) work cross-device when the story is in Supabase (`is_public = true`).

## Next steps (later)

- Supabase Auth → replace `user_sessions.session_id` with `auth.users.id`
- Supabase Storage → upload comic art from `gpt-image-2`
- Row Level Security policies per authenticated user
