alter table public.listings
add column if not exists pickup_latitude double precision,
add column if not exists pickup_longitude double precision;

alter table public.listings
drop constraint if exists listings_pickup_coordinates_check;

alter table public.listings
add constraint listings_pickup_coordinates_check check (
  (
    pickup_latitude is null
    and pickup_longitude is null
  )
  or (
    pickup_latitude between -90 and 90
    and pickup_longitude between -180 and 180
  )
);

create index if not exists listings_pickup_coordinates_idx on public.listings (pickup_latitude, pickup_longitude);
