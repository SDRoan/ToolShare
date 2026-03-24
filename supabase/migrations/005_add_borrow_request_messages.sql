create table if not exists public.borrow_request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.borrow_requests (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  message text not null check (char_length(trim(message)) between 1 and 1000),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists borrow_request_messages_request_id_created_at_idx
on public.borrow_request_messages (request_id, created_at);

create index if not exists borrow_request_messages_sender_id_idx
on public.borrow_request_messages (sender_id);

alter table public.borrow_request_messages enable row level security;

drop policy if exists "Borrow request messages are viewable by request participants" on public.borrow_request_messages;
create policy "Borrow request messages are viewable by request participants"
on public.borrow_request_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.borrow_requests request
    join public.listings listing on listing.id = request.listing_id
    where request.id = borrow_request_messages.request_id
      and (
        request.requester_id = auth.uid()
        or listing.owner_id = auth.uid()
      )
  )
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
      and request.status in ('pending', 'accepted')
      and (
        request.requester_id = auth.uid()
        or listing.owner_id = auth.uid()
      )
  )
);
