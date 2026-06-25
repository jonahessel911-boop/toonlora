-- Panel image QA reviews (AI + human feedback for pipeline art)

create table if not exists panel_image_reviews (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid not null references panels(id) on delete cascade,
  review_type text not null check (review_type in ('ai', 'human')),
  score integer check (score is null or (score >= 0 and score <= 100)),
  passed boolean,
  issues jsonb not null default '[]'::jsonb,
  summary text,
  prompt_fix text,
  human_rating text check (human_rating is null or human_rating in ('approve', 'reject')),
  feedback_note text,
  prompt_used text,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_panel_image_reviews_panel
  on panel_image_reviews(panel_id, created_at desc);

create index if not exists idx_panel_image_reviews_human_approve
  on panel_image_reviews(human_rating, created_at desc)
  where review_type = 'human' and human_rating = 'approve';

alter table panel_image_reviews enable row level security;

comment on table panel_image_reviews is 'AI and human quality reviews for pipeline panel images';
