# BingeOrCringe

BingeOrCringe is a highly interactive, social movie and TV show ranking platform.

*"Rank Movies Your Way. Ignite debates and curate your cinematic soul. Drop your obsessions into the tiers they truly deserve."*

Built with a deeply social focus, users can maintain public or private profiles, curate custom thematic lists, follow friends to see their hot takes, and engage in real-time ephemeral messaging.
## Features & Capabilities
* **Extensive Title Library:** Powered by the TMDB API, search for any movie, TV show, season, or individual episode.
* **Tier-Based Ranking:** Ditch the basic 5-star system. Rank content on a vibrant, color-coded scale that matches how we actually talk about media.
* **Custom Watchlists & Collections:** Build public or private lists to curate categories like "Halloween Horror Marathon" or "My Anime Backlog."
* **Social Ecosystem:** Follow friends, discover trending titles, and check out top rankers across the platform.
* **Real-Time Ephemeral Chat:** Connect directly with friends you follow. Send messages that disappear seamlessly once read or after 24 hours.
* **Granular Privacy Controls:** Keep your entire profile private, or selectively hide specific custom lists while keeping your overall ranking statistics visible.

## Tech Stack
* **Frontend:** Next.js 14 (App Router), React 18, TypeScript, CSS Modules (Custom Design System, no Tailwind)
* **Backend:** Next.js Server Actions, API Routes
* **Database & Auth:** Supabase (PostgreSQL), Supabase Auth (Email + Google OAuth), Row Level Security (RLS)
* **Real-Time:** Supabase Realtime (WebSockets)
* **External APIs:** The Movie Database (TMDB) API
* **Deployment:** Vercel

---

## Release History

* **v1.0.0** — Initial project setup, design system architecture, and core Next.js routing.
* **v1.0.1** — TMDB API integration, search functionality, and title detail pages.
* **v1.1.0** — Public profile creation and core ranking system implementation.
* **v2.0.0** — Introduction of private profiles, visibility toggles, and RLS security enforcement.
* **v2.0.1** — Bug fixes surrounding tier selections and search debouncing.
* **v2.0.2** — UI improvements to the dashboard grid and glassmorphism elements.
* **v2.1.0** — Supabase Auth implementation with strict email verification constraints.
* **v3.0.0** — Custom public and private list creation, with list-specific sharing functionality.
* **v3.0.1 - v3.0.4** — Iterative bug fixes and UI improvements for the custom list grid and modal handling.
* **v4.0.0** — Following/Follower feature rollout, including follower statistics on profiles.
* **v4.0.1** — Bug fixes for self-following constraints and database indexing.
* **v4.0.2** — UI improvements to user search and top rankers components.
* **v5.0.0** — Major UI Improvement overhaul, polishing the cinematic dark theme, animations, and global layout.
* **v6.0.0** — Real-time ephemeral chat app integration via WebSockets.
* **v6.0.1** — Bug fixes for message status syncing and auto-deletion triggers.
* **v6.0.2** — UI fixes and improvements for the chat interface across mobile devices.
* **v6.1.0** — Google OAuth login/signup support integrated into the authentication flow.
* **v6.1.1** — Bug fixes resolving OAuth redirection loops and username uniqueness generation.
* **v7.0.0** — **Stable Release:** Final security audits, HTTP security headers, and Vercel production deployment.
* **v7.0.1** — Bug fixes: Resolved OAuth database trigger crashes and updated email verification redirect behavior.
* **v7.0.2** — Updated Privacy Policy, footer links, and legal document generation.

## Documents
* [Architecture](./architecture.md)
* [SRS](./SRS.md)
