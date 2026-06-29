-- Speed up LP funnel reporting (filter by event_type + lp_id in properties)

create index if not exists idx_analytics_events_lp_funnel
  on analytics_events (event_type, ((properties->>'lp_id')))
  where event_type like 'lp_funnel%';
