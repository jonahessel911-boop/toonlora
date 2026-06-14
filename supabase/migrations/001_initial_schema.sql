-- Toonlora — initial Supabase schema
-- Run in Supabase SQL Editor or via: supabase db push

create extension if not exists "pgcrypto";

-- Anonymous sessions (until auth is added)
create table if not exists user_sessions (
  session_id text primary key,
  credits integer not null default 10,
  free_used boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Series = one user-created story / webtoon series
create table if not exists series (
  id uuid primary key default gen_random_uuid(),
  owner_session_id text not null references user_sessions(session_id) on delete cascade,
  title text not null,
  genre text not null,
  cover_gradient text not null,
  main_character text,
  love_interest text,
  story_idea text,
  user_input jsonb,
  story_bible jsonb,
  continuity_memory jsonb,
  pipeline_result jsonb,
  legacy_pages jsonb not null default '{"chapters":[],"pages":[]}'::jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Episodes per series
create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references series(id) on delete cascade,
  episode_number integer not null,
  title text not null,
  script jsonb not null,
  panel_breakdown jsonb not null,
  image_prompt jsonb not null,
  comic_page jsonb not null,
  text_overlay jsonb not null,
  created_at timestamptz not null default now(),
  unique (series_id, episode_number)
);

create index if not exists idx_series_owner on series(owner_session_id);
create index if not exists idx_series_created on series(created_at desc);
create index if not exists idx_episodes_series on episodes(series_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_sessions_updated_at
  before update on user_sessions
  for each row execute function update_updated_at();

create trigger series_updated_at
  before update on series
  for each row execute function update_updated_at();

-- Row Level Security (service role bypasses; ready for future anon/auth policies)
alter table user_sessions enable row level security;
alter table series enable row level security;
alter table episodes enable row level security;

-- Public read for shared series
create policy "Public can read shared series"
  on series for select
  using (is_public = true);

create policy "Public can read episodes of shared series"
  on episodes for select
  using (
    exists (
      select 1 from series s
      where s.id = episodes.series_id and s.is_public = true
    )
  );

comment on table series is 'Webtoon series — Story Bible + metadata';
comment on table episodes is 'Generated episodes with script, art refs, and text overlays';
comment on table user_sessions is 'Anonymous session credits until Supabase Auth';
