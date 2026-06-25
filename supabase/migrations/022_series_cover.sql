-- Series cover art for catalog / creator admin

alter table series add column if not exists display_title text;
alter table series add column if not exists cover_art_url text;
alter table series add column if not exists cover_image_prompt text;

comment on column series.display_title is 'Catchy catalog title e.g. Ferrari — The Man Who Let Drivers Die for Glory';
comment on column series.cover_art_url is 'Public URL for vertical series cover poster';
comment on column series.cover_image_prompt is 'gpt-image-1 prompt used for cover generation';
