# Social Cine Hub

A full-stack starter website for:
- photo posts
- stories
- upcoming events
- short film videos
- reels
- comments
- admin dashboard uploads

## Stack
- Next.js (App Router)
- Supabase (Auth + Postgres)
- Cloudinary (image/video uploads)
- Vercel deployment

## Setup
1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Create Cloudinary account.
4. Copy `.env.example` to `.env.local` and fill values.
5. Install dependencies:
   ```bash
   npm install
   ```
6. Run project:
   ```bash
   npm run dev
   ```

## Admin access
After signing up, update the user's role in the `profiles` table from `user` to `admin`.

## Main routes
- `/` home feed
- `/stories`
- `/events`
- `/reels`
- `/shortfilms`
- `/login`
- `/dashboard` admin upload panel

## Notes
- Stories auto-hide after `expires_at`.
- Only admin can create content from dashboard.
- Comments are open to signed-in users.
