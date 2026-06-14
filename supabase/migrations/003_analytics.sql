-- Analytics: reading progress, platform time, login events

create table if not exists reading_progress (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references user_sessions(session_id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  series_id text not null,
  episode_number integer not null default 1,
  max_panel_reached integer not null default 0,
  total_panels integer not null default 10,
  completed_at timestamptz,
  first_opened_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, series_id, episode_number)
);

create index if not exists idx_reading_progress_session on reading_progress(session_id);
create index if not exists idx_reading_progress_profile on reading_progress(profile_id);
create index if not exists idx_reading_progress_completed on reading_progress(completed_at);

create table if not exists platform_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references user_sessions(session_id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  entry_path text,
  started_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  duration_seconds integer not null default 0
);

create index if not exists idx_platform_sessions_session on platform_sessions(session_id);
create index if not exists idx_platform_sessions_started on platform_sessions(started_at);

create table if not exists login_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  logged_in_at timestamptz not null default now(),
  method text not null default 'email'
);

create index if not exists idx_login_events_profile on login_events(profile_id);
create index if not exists idx_login_events_logged_in on login_events(logged_in_at);
