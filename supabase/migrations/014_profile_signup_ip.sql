alter table profiles
  add column if not exists signup_ip text;

comment on column profiles.signup_ip is 'Client IP at first signup (from x-forwarded-for on the register API).';
