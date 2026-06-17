-- VIP subscription fields on anonymous sessions
alter table user_sessions
  add column if not exists subscription_status text,
  add column if not exists subscription_plan_id text,
  add column if not exists subscription_stripe_id text,
  add column if not exists subscription_period_end timestamptz;
