-- One free catalog episode per anonymous session (episode 1 of a single series)
alter table user_sessions
  add column if not exists free_read_series_id text;
