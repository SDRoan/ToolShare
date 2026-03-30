alter table public.borrow_requests
add column if not exists picked_up_at timestamptz,
add column if not exists returned_at timestamptz,
add column if not exists cancelled_at timestamptz;

alter table public.borrow_requests
drop constraint if exists borrow_requests_status_check;

alter table public.borrow_requests
add constraint borrow_requests_status_check check (
  status in ('pending', 'accepted', 'borrowed', 'returned', 'declined', 'cancelled')
);

create index if not exists borrow_requests_listing_id_dates_idx
on public.borrow_requests (listing_id, start_date, end_date);

create or replace function public.enforce_borrow_request_lifecycle()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'borrowed' and new.picked_up_at is null then
    new.picked_up_at = timezone('utc', now());
  end if;

  if new.status = 'returned' and new.returned_at is null then
    new.returned_at = timezone('utc', now());
  end if;

  if new.status = 'cancelled' and new.cancelled_at is null then
    new.cancelled_at = timezone('utc', now());
  end if;

  if new.status in ('pending', 'accepted', 'borrowed') then
    if exists (
      select 1
      from public.borrow_requests existing
      where existing.listing_id = new.listing_id
        and existing.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
        and existing.status in ('accepted', 'borrowed')
        and existing.start_date <= new.end_date
        and existing.end_date >= new.start_date
    ) then
      raise exception 'Those dates are already booked for this listing.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists borrow_request_lifecycle_trigger on public.borrow_requests;

create trigger borrow_request_lifecycle_trigger
before insert or update on public.borrow_requests
for each row
execute procedure public.enforce_borrow_request_lifecycle();

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
  and status in ('pending', 'accepted', 'borrowed', 'returned', 'declined', 'cancelled')
);

drop policy if exists "Requesters can update their own borrow requests" on public.borrow_requests;
create policy "Requesters can update their own borrow requests"
on public.borrow_requests
for update
to authenticated
using (auth.uid() = requester_id)
with check (
  auth.uid() = requester_id
  and status in ('pending', 'accepted', 'borrowed', 'returned', 'declined', 'cancelled')
);

drop policy if exists "Borrow request participants can send messages" on public.borrow_request_messages;
create policy "Borrow request participants can send messages"
on public.borrow_request_messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and exists (
    select 1
    from public.borrow_requests request
    join public.listings listing on listing.id = request.listing_id
    where request.id = borrow_request_messages.request_id
      and request.status in ('pending', 'accepted', 'borrowed')
      and (
        request.requester_id = auth.uid()
        or listing.owner_id = auth.uid()
      )
  )
);

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
      and (
        request.status = 'returned'
        or (
          request.status in ('accepted', 'borrowed')
          and request.end_date <= current_date
        )
      )
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
      and (
        request.status = 'returned'
        or (
          request.status in ('accepted', 'borrowed')
          and request.end_date <= current_date
        )
      )
  )
);
