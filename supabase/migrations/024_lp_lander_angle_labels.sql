-- Admin-editable display names for LP lander angles (keyed by report_key, e.g. "5::wework").

create table if not exists lp_lander_angle_labels (
  report_key text primary key,
  label text not null,
  updated_at timestamptz not null default now()
);
