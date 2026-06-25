-- Enrich reading_progress for per-user engagement & taste profiling

alter table reading_progress
  add column if not exists series_title text,
  add column if not exists genre text;

create index if not exists idx_reading_progress_profile_series
  on reading_progress(profile_id, series_id);

create index if not exists idx_reading_progress_genre
  on reading_progress(genre)
  where genre is not null;
