alter table profiles
  add column if not exists password_hash text;

comment on column profiles.password_hash is 'Scrypt hash for email+password sign-in (salt:hash hex).';

alter table user_sessions
  add column if not exists subscription_welcome_sent boolean not null default false;

comment on column user_sessions.subscription_welcome_sent is 'True after post-subscription welcome email was sent.';
