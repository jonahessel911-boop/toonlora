alter table profiles
  add column if not exists country_code text;

comment on column profiles.country_code is 'ISO-style country code from signup (e.g. NL, BE, OTHER)';
