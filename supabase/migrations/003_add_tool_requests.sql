create table if not exists public.tool_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 4 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  category text not null check (category in ('Tools', 'Outdoor', 'Kitchen', 'Electronics', 'Sports', 'Other')),
  neighborhood text not null,
  needed_by date,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tool_request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.tool_requests (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  message text not null check (char_length(message) between 2 and 1000),
  media_url text,
  media_kind text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint tool_request_comments_media_check check (
    (
      media_url is null
      and media_kind is null
    )
    or (
      media_url is not null
      and media_kind in ('image', 'video')
    )
  )
);

create index if not exists tool_requests_requester_id_idx on public.tool_requests (requester_id);
create index if not exists tool_requests_category_idx on public.tool_requests (category);
create index if not exists tool_requests_neighborhood_idx on public.tool_requests (neighborhood);
create index if not exists tool_requests_needed_by_idx on public.tool_requests (needed_by);
create index if not exists tool_request_comments_request_id_idx on public.tool_request_comments (request_id);
create index if not exists tool_request_comments_author_id_idx on public.tool_request_comments (author_id);

alter table public.tool_requests enable row level security;
alter table public.tool_request_comments enable row level security;

drop policy if exists "Tool requests are viewable by everyone" on public.tool_requests;
create policy "Tool requests are viewable by everyone"
on public.tool_requests
for select
to public
using (true);

drop policy if exists "Users can create their own tool requests" on public.tool_requests;
create policy "Users can create their own tool requests"
on public.tool_requests
for insert
to authenticated
with check (auth.uid() = requester_id);

drop policy if exists "Users can update their own tool requests" on public.tool_requests;
create policy "Users can update their own tool requests"
on public.tool_requests
for update
to authenticated
using (auth.uid() = requester_id)
with check (auth.uid() = requester_id);

drop policy if exists "Users can delete their own tool requests" on public.tool_requests;
create policy "Users can delete their own tool requests"
on public.tool_requests
for delete
to authenticated
using (auth.uid() = requester_id);

drop policy if exists "Tool request comments are viewable by everyone" on public.tool_request_comments;
create policy "Tool request comments are viewable by everyone"
on public.tool_request_comments
for select
to public
using (true);

drop policy if exists "Authenticated users can create request comments" on public.tool_request_comments;
create policy "Authenticated users can create request comments"
on public.tool_request_comments
for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.tool_requests request_post
    where request_post.id = tool_request_comments.request_id
  )
);

drop policy if exists "Users can update their own request comments" on public.tool_request_comments;
create policy "Users can update their own request comments"
on public.tool_request_comments
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "Users can delete their own request comments" on public.tool_request_comments;
create policy "Users can delete their own request comments"
on public.tool_request_comments
for delete
to authenticated
using (auth.uid() = author_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tool-request-media',
  'tool-request-media',
  true,
  20971520,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Tool request media is viewable by everyone" on storage.objects;
create policy "Tool request media is viewable by everyone"
on storage.objects
for select
to public
using (bucket_id = 'tool-request-media');

drop policy if exists "Authenticated users can upload request media" on storage.objects;
create policy "Authenticated users can upload request media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tool-request-media'
  and auth.uid() = owner
);

drop policy if exists "Users can update their own request media" on storage.objects;
create policy "Users can update their own request media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'tool-request-media'
  and auth.uid() = owner
)
with check (
  bucket_id = 'tool-request-media'
  and auth.uid() = owner
);

drop policy if exists "Users can delete their own request media" on storage.objects;
create policy "Users can delete their own request media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'tool-request-media'
  and auth.uid() = owner
);
