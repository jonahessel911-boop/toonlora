-- Publishing workflow: admin + creator series

alter table series add column if not exists source text not null default 'creator';
alter table series add column if not exists status text not null default 'draft';
alter table series add column if not exists published_at timestamptz;
alter table series add column if not exists featured_rank integer;
alter table series add column if not exists synopsis text;
alter table series add column if not exists creator_display_name text;
alter table series add column if not exists views_count integer not null default 0;
alter table series add column if not exists likes_count integer not null default 0;

create index if not exists idx_series_published on series(status, published_at desc);
create index if not exists idx_series_source on series(source);
create index if not exists idx_series_genre on series(genre);
create index if not exists idx_series_featured on series(featured_rank);

-- Legacy rows: treat old public series as published creator content
update series
set
  status = 'published',
  published_at = coalesce(published_at, created_at),
  source = coalesce(nullif(source, ''), 'creator')
where is_public = true and status = 'draft';
