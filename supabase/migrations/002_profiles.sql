-- User profiles (until Supabase Auth replaces mock signup)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references user_sessions(session_id) on delete cascade,
  email text not null,
  full_name text not null,
  wants_recommendations boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email),
  unique (session_id)
);

create index if not exists idx_profiles_email on profiles(email);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

alter table profiles enable row level security;

comment on table profiles is 'Registered user profiles linked to anonymous session until Auth';
