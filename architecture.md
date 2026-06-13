# BingeOrCringe Architecture & Workflow

## Overview
BingeOrCringe is a modern web application built on the **Next.js 14 App Router**, leveraging React Server Components for performance, and **Supabase** for a robust, real-time backend. The architecture is designed to be fully serverless, highly secure, and highly scalable.

## Frontend Architecture (Next.js 14 App Router)

### 1. Server Components vs. Client Components
The application strictly divides rendering responsibilities to optimize for SEO, performance, and security:
*   **Server Components (Default):** Pages like the Dashboard, User Profiles, and Title detail pages are rendered on the server. They fetch data directly from Supabase or TMDB securely, without exposing API keys to the browser, and ship zero JavaScript to the client for those static portions.
*   **Client Components (`'use client'`):** Highly interactive islands like the `ChatInterface`, `RankingModal`, and `SearchInput` are isolated client components. They handle state management (React `useState`, `useEffect`), form submissions, and WebSocket real-time subscriptions.

### 2. Styling System
The project uses **CSS Modules** (`*.module.css`) paired with a global CSS variables (`globals.css`) design system. This allows for locally scoped, conflict-free styling while maintaining a consistent "cinematic dark mode" aesthetic governed by global design tokens (colors, spacing, fonts).

### 3. Server Actions for Mutations
Instead of traditional API routes (`/api/...`), the application heavily utilizes **Next.js Server Actions** (`src/lib/.../actions.ts`). When a user submits a form (e.g., updating their profile, ranking a movie, or creating a custom list), a Server Action is invoked. This allows server-side input validation, secure database execution, and automatic cache invalidation (`revalidatePath`), all without writing custom API boilerplate.

## Backend Architecture (Supabase)

### 1. Authentication
Auth is handled via `@supabase/ssr`.
*   Users can sign up via Email/Password or Google OAuth.
*   Authentication state is synchronized between the client and server using Next.js Middleware (`src/middleware.ts`), ensuring protected routes (like `/dashboard`) seamlessly redirect unauthorized users.

### 2. Database Schema (PostgreSQL)
The application uses a relational schema:
*   **profiles:** Tied directly to the `auth.users` table via triggers. Stores usernames, display names, and privacy toggles.
*   **rankings:** The core entity. Stores user ratings tied to TMDB metadata (movie ID, tier, tags).
*   **lists & list_items:** Allows many-to-many relationships where users can group multiple `rankings` into custom thematic collections.
*   **follows:** Self-referencing many-to-many table mapping `follower_id` to `following_id`.
*   **messages:** Stores ephemeral chat logs between users.
*   **notifications:** Stores system events (e.g., "User X followed you").

### 3. Row Level Security (RLS)
Security is pushed to the database layer. Supabase RLS policies are strictly defined for every table:
*   Users can only `INSERT`, `UPDATE`, or `DELETE` rows where `user_id = auth.uid()`.
*   Users can only `SELECT` (read) rankings or lists if the owner's profile `is_public = true`, OR if they are the owner themselves. 
*   This architecture ensures that even if the frontend is completely bypassed, malicious API requests are stopped natively by the database.

### 4. Real-Time Capabilities
Supabase Realtime (WebSockets) is utilized for the ephemeral chat feature.
*   The `messages` table is broadcasted over the `public:messages` channel.
*   The client subscribes to inserts on this table.
*   When a message is read, an `UPDATE` marks it as viewed, and a PostgreSQL trigger or `pg_cron` handles the ephemeral deletion logic to scrub it from the database permanently.

## External Integrations

### TMDB (The Movie Database) API
All movie and TV metadata is sourced dynamically from TMDB.
*   Search queries and title detail requests are routed through a server-side client (`src/lib/tmdb/client.ts`).
*   This architecture prevents the `TMDB_API_KEY` from ever reaching the client bundle.
*   Image paths returned by TMDB are securely parsed and rendered using Next.js `<Image>` component for automatic optimization.

## Workflow Summary
1.  **User Visits App:** Middleware checks session. Unauthenticated users see the landing page.
2.  **Search:** User types a query. A debounced Client Component hits a Server Action, fetching TMDB data securely.
3.  **Action:** User clicks "Rank This". A Modal opens (Client). They submit, triggering a Server Action.
4.  **Database:** Server Action validates input and writes to Supabase. RLS ensures authorization.
5.  **Revalidation:** Server Action calls `revalidatePath`, instantly updating the user's dashboard with the new ranking.
