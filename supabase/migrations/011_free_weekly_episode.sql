-- Free tier: 1 episode read per calendar week (tracked per session)
alter table user_sessions
  add column if not exists free_episode_week text,
  add column if not exists free_episode_claim jsonb;
