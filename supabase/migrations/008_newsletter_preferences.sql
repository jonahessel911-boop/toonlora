alter table profiles
  add column if not exists wants_weekly_newsletter boolean not null default false;

alter table profiles
  add column if not exists newsletter_topics text[] not null default '{}';

comment on column profiles.wants_weekly_newsletter is 'Opt-in for weekly free story emails';
comment on column profiles.newsletter_topics is 'Selected topics: business, history';
