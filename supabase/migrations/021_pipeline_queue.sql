-- Autonomous pipeline job queue (processed by server/pipeline-worker.ts)

create table if not exists pipeline_queue (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  category text not null default 'business',
  mode text not null default 'lean' check (mode in ('lean', 'full')),
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  series_id uuid references series(id) on delete set null,
  error text,
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists idx_pipeline_queue_pending
  on pipeline_queue (status, priority desc, created_at asc)
  where status = 'pending';

create index if not exists idx_pipeline_queue_series
  on pipeline_queue (series_id)
  where series_id is not null;

comment on table pipeline_queue is 'Story topics waiting for autonomous pipeline worker';
