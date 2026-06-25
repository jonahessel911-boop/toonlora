-- Content generation pipeline: research, panels, run checkpointing

alter table series add column if not exists slug text;
alter table series add column if not exists category text;
alter table series add column if not exists research_json jsonb;

create unique index if not exists idx_series_slug on series(slug) where slug is not null;
create index if not exists idx_series_category on series(category);

create table if not exists panels (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  panel_number integer not null,
  chapter_number integer not null default 1,
  visual_description text,
  caption text,
  dialogue text,
  image_prompt text,
  image_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (episode_id, panel_number)
);

create index if not exists idx_panels_episode on panels(episode_id);
create index if not exists idx_panels_status on panels(episode_id, status);

create table if not exists pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references series(id) on delete cascade,
  step text not null,
  status text not null default 'running',
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pipeline_runs_series on pipeline_runs(series_id, created_at desc);

create trigger panels_updated_at
  before update on panels
  for each row execute function update_updated_at();

create trigger pipeline_runs_updated_at
  before update on pipeline_runs
  for each row execute function update_updated_at();

alter table panels enable row level security;
alter table pipeline_runs enable row level security;

comment on table panels is 'Per-panel script, prompts, and generated art for pipeline episodes';
comment on table pipeline_runs is 'Checkpoint log for automated content pipeline steps';
