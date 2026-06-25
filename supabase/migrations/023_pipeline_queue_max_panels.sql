-- Per-story panel cap for autonomous full-pipeline queue jobs

alter table pipeline_queue
  add column if not exists max_panels integer not null default 36
    check (max_panels >= 5 and max_panels <= 40);

comment on column pipeline_queue.max_panels is 'Max panels for episode 1 when mode=full';
