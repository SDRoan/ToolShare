create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  neighborhood text,
  avatar_url text,
  incoming_requests_seen_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  category text not null check (category in ('Tools', 'Outdoor', 'Kitchen', 'Electronics', 'Sports', 'Other')),
  photo_url text,
  neighborhood text not null,
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.borrow_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default timezone('utc', now()),
  constraint borrow_requests_date_check check (end_date >= start_date)
);

create index if not exists listings_owner_id_idx on public.listings (owner_id);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_neighborhood_idx on public.listings (neighborhood);
create index if not exists borrow_requests_listing_id_idx on public.borrow_requests (listing_id);
create index if not exists borrow_requests_requester_id_idx on public.borrow_requests (requester_id);
create index if not exists borrow_requests_status_idx on public.borrow_requests (status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, neighborhood, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'neighborhood', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.borrow_requests enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
on public.profiles
for select
to public
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Listings are viewable by everyone" on public.listings;
create policy "Listings are viewable by everyone"
on public.listings
for select
to public
using (true);

drop policy if exists "Users can create their own listings" on public.listings;
create policy "Users can create their own listings"
on public.listings
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "Users can update their own listings" on public.listings;
create policy "Users can update their own listings"
on public.listings
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Users can delete their own listings" on public.listings;
create policy "Users can delete their own listings"
on public.listings
for delete
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "Borrow requests are viewable by owners and requesters" on public.borrow_requests;
create policy "Borrow requests are viewable by owners and requesters"
on public.borrow_requests
for select
to authenticated
using (
  auth.uid() = requester_id
  or exists (
    select 1
    from public.listings listing
    where listing.id = borrow_requests.listing_id
      and listing.owner_id = auth.uid()
  )
);

drop policy if exists "Users can create borrow requests for other people's listings" on public.borrow_requests;
create policy "Users can create borrow requests for other people's listings"
on public.borrow_requests
for insert
to authenticated
with check (
  auth.uid() = requester_id
  and exists (
    select 1
    from public.listings listing
    where listing.id = borrow_requests.listing_id
      and listing.owner_id <> auth.uid()
  )
);

drop policy if exists "Owners can update incoming borrow requests" on public.borrow_requests;
create policy "Owners can update incoming borrow requests"
on public.borrow_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.listings listing
    where listing.id = borrow_requests.listing_id
      and listing.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.listings listing
    where listing.id = borrow_requests.listing_id
      and listing.owner_id = auth.uid()
  )
  and status in ('pending', 'accepted', 'declined')
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Listing photos are viewable by everyone" on storage.objects;
create policy "Listing photos are viewable by everyone"
on storage.objects
for select
to public
using (bucket_id = 'listing-photos');

drop policy if exists "Authenticated users can upload listing photos" on storage.objects;
create policy "Authenticated users can upload listing photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-photos'
  and auth.uid() = owner
);

drop policy if exists "Users can update their own listing photos" on storage.objects;
create policy "Users can update their own listing photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listing-photos'
  and auth.uid() = owner
)
with check (
  bucket_id = 'listing-photos'
  and auth.uid() = owner
);

drop policy if exists "Users can delete their own listing photos" on storage.objects;
create policy "Users can delete their own listing photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-photos'
  and auth.uid() = owner
);
