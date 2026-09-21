insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-photos', 'business-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
create policy photos_owner_read on storage.objects for select to authenticated using (bucket_id = 'business-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy photos_owner_insert on storage.objects for insert to authenticated with check (bucket_id = 'business-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Immutable object IDs: no client UPDATE. Deletion/retention is an operational task;
-- draft removal only removes a reference, preserving historical campaign snapshots.
