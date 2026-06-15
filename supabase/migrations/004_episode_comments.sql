-- Episode comments (per series + episode)

create table if not exists episode_comments (
  id uuid primary key default gen_random_uuid(),
  series_id text not null,
  episode_number integer not null default 1,
  profile_id uuid references profiles(id) on delete set null,
  session_id text references user_sessions(session_id) on delete set null,
  author_name text not null,
  author_email text,
  body text not null,
  likes integer not null default 0,
  dislikes integer not null default 0,
  is_spoiler boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_episode_comments_series_ep
  on episode_comments(series_id, episode_number);
create index if not exists idx_episode_comments_created
  on episode_comments(created_at desc);
create index if not exists idx_episode_comments_likes
  on episode_comments(likes desc);
