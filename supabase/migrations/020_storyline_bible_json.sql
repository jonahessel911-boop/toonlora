-- Complete storyline bible (full timeline + episode breakdown) before scripts/panels

alter table series add column if not exists storyline_bible_json jsonb;

comment on column series.storyline_bible_json is 'Full series storyline bible: timeline narrative + episode breakdown before panel scripts';
