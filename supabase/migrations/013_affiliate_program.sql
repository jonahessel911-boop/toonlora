-- Affiliate program: partners, applications, conversions, profile attribution

create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  email text,
  company text,
  is_active boolean not null default false,
  payment_method text check (payment_method in ('iban', 'paypal')),
  payment_details jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists affiliate_applications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company text,
  description text,
  traffic_sources text[] not null default '{}',
  affiliate_id uuid references affiliates(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists affiliate_signups (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  country_code text not null,
  commission_region text not null check (commission_region in ('eu', 'us', 'other')),
  commission_cents integer not null default 0,
  converted_at timestamptz not null default now(),
  unique (profile_id)
);

create table if not exists affiliate_purchases (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  session_id text,
  purchase_type text not null check (purchase_type in ('subscription', 'coins')),
  amount_cents integer,
  stripe_session_id text,
  purchased_at timestamptz not null default now()
);

alter table profiles
  add column if not exists referred_by_affiliate_id uuid references affiliates(id) on delete set null;

create index if not exists idx_affiliates_slug on affiliates (slug);
create index if not exists idx_affiliates_active on affiliates (is_active);
create index if not exists idx_affiliate_signups_affiliate on affiliate_signups (affiliate_id);
create index if not exists idx_affiliate_signups_converted on affiliate_signups (converted_at);
create index if not exists idx_affiliate_purchases_affiliate on affiliate_purchases (affiliate_id);
create index if not exists idx_profiles_referred_affiliate on profiles (referred_by_affiliate_id);

comment on column affiliates.slug is 'URL slug for ?aff= links, e.g. business-comics-nl';
comment on column affiliates.payment_details is 'JSON: iban, account_name, paypal_email';
comment on column affiliate_signups.commission_cents is 'Signup commission in cents (EU €0.30, US €0.20)';
