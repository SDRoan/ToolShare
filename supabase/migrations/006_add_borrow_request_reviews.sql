create table if not exists public.borrow_request_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.borrow_requests (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(trim(comment)) between 10 and 1000),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists borrow_request_reviews_listing_id_idx
on public.borrow_request_reviews (listing_id);

create index if not exists borrow_request_reviews_reviewer_id_idx
on public.borrow_request_reviews (reviewer_id);

alter table public.borrow_request_reviews enable row level security;

drop policy if exists "Borrow request reviews are viewable by everyone" on public.borrow_request_reviews;
create policy "Borrow request reviews are viewable by everyone"
on public.borrow_request_reviews
for select
to public
using (true);

drop policy if exists "Eligible borrowers can create reviews" on public.borrow_request_reviews;
create policy "Eligible borrowers can create reviews"
on public.borrow_request_reviews
for insert
to authenticated
with check (
  auth.uid() = reviewer_id
  and exists (
    select 1
    from public.borrow_requests request
    where request.id = borrow_request_reviews.request_id
      and request.listing_id = borrow_request_reviews.listing_id
      and request.requester_id = auth.uid()
      and request.status = 'accepted'
      and request.end_date <= current_date
  )
);

drop policy if exists "Review authors can update their own reviews" on public.borrow_request_reviews;
create policy "Review authors can update their own reviews"
on public.borrow_request_reviews
for update
to authenticated
using (
  auth.uid() = reviewer_id
)
with check (
  auth.uid() = reviewer_id
  and exists (
    select 1
    from public.borrow_requests request
    where request.id = borrow_request_reviews.request_id
      and request.listing_id = borrow_request_reviews.listing_id
      and request.requester_id = auth.uid()
      and request.status = 'accepted'
      and request.end_date <= current_date
  )
);
