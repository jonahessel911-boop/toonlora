-- Product analytics events (next episode clicks, checkouts, paywall views)

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references user_sessions(session_id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  event_type text not null,
  series_id text,
  episode_number integer,
  plan_id text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_type on analytics_events(event_type);
create index if not exists idx_analytics_events_created on analytics_events(created_at desc);
create index if not exists idx_analytics_events_series on analytics_events(series_id);
