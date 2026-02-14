This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.






# Smart Bookmark Manager

A real-time, private bookmark manager built with Next.js and Supabase.

# Live URL
[https://smart-bookmarks-app-kappa.vercel.app/]

# Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **Database & Auth:** Supabase (PostgreSQL)
- **Real-time:** Supabase Presence/Channels
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

- 

# Problems Faced & Solutions



# 1. OAuth State Management
**Problem:** When using the new `@supabase/ssr` package, the authentication state wouldn't always persist correctly between the server-side redirect and the client-side session.
**Solution:** Implemented a dedicated `auth/callback` route handler that explicitly exchanges the Google auth code for a session and stores it in cookies using the `createServerClient`.

# 2. Real-time Synchronization across Tabs
**Problem:** Initially, adding a bookmark in one tab required a refresh in the other.
**Solution:** Leveraged Supabase's `postgres_changes` listener. By subscribing to the `bookmarks` table in a `useEffect` hook, the UI triggers a re-fetch automatically whenever a broadcast event is received.

# 3. Row Level Security (RLS)
**Problem:** Ensuring User A cannot see User B's bookmarks.
**Solution:** Enabled RLS on the PostgreSQL database and created policies that check the `auth.uid()` against the `user_id` column for all SELECT, INSERT, and DELETE operations.
