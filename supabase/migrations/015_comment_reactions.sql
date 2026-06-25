-- One reaction (like OR dislike) per browser session per comment.

create table if not exists comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references episode_comments(id) on delete cascade,
  session_id text not null references user_sessions(session_id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  reaction text not null check (reaction in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique (comment_id, session_id)
);

create index if not exists idx_comment_reactions_comment
  on comment_reactions (comment_id);

create index if not exists idx_comment_reactions_session
  on comment_reactions (session_id);
