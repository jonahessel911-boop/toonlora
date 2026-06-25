-- Full panel script fields (source of truth before image generation)

alter table panels add column if not exists panel_type text;
alter table panels add column if not exists chapter_title text;
alter table panels add column if not exists character_details text;
alter table panels add column if not exists background_props text;
alter table panels add column if not exists text_placement text;
alter table panels add column if not exists mood text;
alter table panels add column if not exists era_details text;
alter table panels add column if not exists script_json jsonb;

comment on column panels.script_json is 'Full panel script spec from scriptWriter — source of truth for promptGenerator';
