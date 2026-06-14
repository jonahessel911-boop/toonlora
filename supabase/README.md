# Supabase setup — Toonlora

## 1. Create project

1. Go to [supabase.com](https://supabase.com) → New project
2. Copy **Project URL** and **service_role key** (Settings → API)

## 2. Run migration

Open **SQL Editor** in Supabase and paste the contents of:

```
supabase/migrations/001_initial_schema.sql
```

Run the script. This creates:

| Table | Purpose |
|-------|---------|
| `user_sessions` | Anonymous credits (until Auth) |
| `series` | Story Bible + series metadata |
| `episodes` | Scripts, panels, overlays per episode |

## 3. Configure env

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_USE_DATABASE=true

OPENAI_API_KEY=sk-...
```

> **Important:** `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in client code.

## 4. Restart dev server

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
