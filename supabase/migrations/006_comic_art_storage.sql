-- Public bucket for generated episode artwork

insert into storage.buckets (id, name, public)
values ('comic-art', 'comic-art', true)
on conflict (id) do update set public = true;

create policy "Public read comic art"
  on storage.objects for select
  using (bucket_id = 'comic-art');
