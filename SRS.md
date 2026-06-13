# Software Requirements Specification (SRS) for BingeOrCringe

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to specify the software requirements for **BingeOrCringe**, a web-based platform that allows users to search for movies and TV shows, rank them into personalized tiers, curate custom watchlists, and interact socially with other users.

### 1.2 Scope
BingeOrCringe serves as both a personal media tracker and a social platform. It interfaces with external media databases (TMDB) to provide an exhaustive catalog of content. Users can categorize media, maintain public or private profiles, follow friends, and send ephemeral messages.

## 2. Overall Description

### 2.1 Product Perspective
BingeOrCringe is a standalone application. It relies heavily on two external services:
*   **The Movie Database (TMDB) API** for fetching rich media metadata, posters, and search capabilities.
*   **Supabase** as the Backend-as-a-Service (BaaS) providing PostgreSQL data storage, Authentication, and Realtime WebSockets.

### 2.2 User Classes and Characteristics
*   **Anonymous Visitors:** Can view the landing page and public user profiles/lists. Cannot search the internal ranking engine or modify data.
*   **Authenticated Users:** Can rank movies, create lists, manage profile settings, toggle privacy, follow other users, and use the real-time chat.

### 2.3 Operating Environment
The application is a web-based platform hosted on **Vercel**. It is designed to be fully responsive, supporting modern desktop and mobile browsers (Chrome, Safari, Firefox, Edge).

## 3. System Features

### 3.1 Authentication & Authorization
*   **Description:** Secure user registration, login, and session management.
*   **Requirements:**
    *   System must support Email/Password registration with mandatory email verification.
    *   System must support Google OAuth SSO.
    *   System must enforce unique usernames (3-20 characters, alphanumeric).
    *   System must map authenticated users to a dedicated `profile` record automatically.

### 3.2 Title Search & Browsing
*   **Description:** Searching the global media database.
*   **Requirements:**
    *   System must connect to TMDB via a secure server-side client to retrieve media data.
    *   System must support searching by keywords with debounced inputs.
    *   System must display rich detail pages for Movies and TV Shows (including seasons and episodes).

### 3.3 The Ranking Engine
*   **Description:** The core capability allowing users to categorize media.
*   **Requirements:**
    *   Users must be able to rank a title into one of 5 defined tiers: Goated, Binge, Mid, Cringe, Trash.
    *   Users must be able to assign up to 3 descriptive tags to a ranking.
    *   Rankings must be unique per user, per title (UPSERT logic).

### 3.4 Custom Lists & Watchlists
*   **Description:** Grouping rankings into thematic collections.
*   **Requirements:**
    *   Users must be able to create custom lists with a title.
    *   Users must be able to append existing rankings into these lists.
    *   Users must be able to toggle individual lists as public or private.

### 3.5 Social & Profiles
*   **Description:** Public-facing user identity and networking.
*   **Requirements:**
    *   Users must have a profile page accessible via `/u/[username]`.
    *   Users must be able to toggle their entire profile as private (hiding all rankings from non-owners).
    *   System must display total follower/following counts on the profile.
    *   System must compile a global "Top Rankers" leaderboard highlighting the most active public accounts.

### 3.6 Real-Time Ephemeral Chat
*   **Description:** Direct messaging between users.
*   **Requirements:**
    *   Users must be able to send text messages to other registered users.
    *   Messages must be delivered in real-time via WebSockets.
    *   Messages must auto-delete upon being marked as "read" or automatically expire after 24 hours.

## 4. Non-Functional Requirements

### 4.1 Security
*   **Data Protection:** All backend mutations must enforce Row Level Security (RLS) to ensure users can only modify their own data.
*   **XSS Mitigation:** The system must escape all user-generated content natively via React before DOM insertion.
*   **API Secrecy:** Third-party API keys (TMDB, Supabase Service Role) must be restricted exclusively to the server environment and never leaked to the client bundle.
*   **HTTP Security:** Application must employ strict security headers (X-Frame-Options, Referrer-Policy, Strict-Transport-Security).

### 4.2 Performance
*   System must utilize React Server Components (RSC) to minimize the JavaScript bundle size delivered to the client.
*   System must leverage Next.js caching mechanics for static media assets and TMDB queries where appropriate.

### 4.3 Availability
*   Deployed on Vercel's Edge Network, the application aims for standard 99.9% uptime. Database availability is bound to Supabase managed infrastructure.
