# ToolShare

ToolShare is a full-stack neighborhood lending library built with Next.js 14, Supabase, and Tailwind CSS. It lets neighbors list useful items, browse what is nearby, send borrow requests, and manage everything from a simple dashboard.

## Stack

- Next.js 14 App Router with Server Components
- Supabase Auth, Postgres, Row Level Security, and Storage
- Tailwind CSS
- React Hook Form + Zod
- Sonner for toast notifications

## Features

- Email/password signup and login with Supabase Auth
- Protected dashboard, create, and edit routes
- Public landing page, browse page, and listing detail page
- Tool listings with photo uploads to Supabase Storage
- Keyword search and filters for category and neighborhood
- Borrow requests with pending, accepted, and declined states
- In-app unread badge for incoming requests
- Responsive UI, async loading skeletons, and empty states

## Routes

- `/` landing page
- `/browse` public browse page
- `/listings/[id]` public listing detail page
- `/dashboard` protected dashboard with tabs
- `/listings/new` protected create listing page
- `/listings/[id]/edit` protected edit listing page
- `/login` and `/signup` auth pages

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find both values in Supabase under `Project Settings -> API`.

## Supabase Setup

1. Create a new Supabase project.
2. Run the SQL in [supabase/migrations/001_init.sql](/Users/saibyasachiruhan/Desktop/Borrow it/supabase/migrations/001_init.sql) from the SQL editor, or apply it with the Supabase CLI if you use local migrations.
3. The migration creates:
   - `profiles`
   - `listings`
   - `borrow_requests`
   - a public `listing-photos` storage bucket
   - all required RLS policies
4. In `Authentication -> URL Configuration`, add your local app URL, usually `http://localhost:3000`.
5. Optional but useful for local testing: disable `Confirm email` under `Authentication -> Providers -> Email` so signup logs the user in immediately. If you keep email confirmation enabled, the app already includes `/auth/callback` for the confirmation flow.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Notes

- All write access is enforced with Supabase Row Level Security.
- Public users can browse listings, but only authenticated users can create listings or send borrow requests.
- Storage uploads use the authenticated user’s session and the `listing-photos` bucket policies from the migration.

## Suggested Next Improvements

- Add avatar uploads for profiles
- Add availability calendars or blackout dates
- Add request cancellation for borrowers
- Add email notifications for accepted or declined requests
