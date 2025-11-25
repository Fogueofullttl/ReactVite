# FPTM - Sistema de Gestión de Torneos

## Overview
The FPTM Tournament Management System is designed to streamline the administration of table tennis tournaments for the Puerto Rican Table Tennis Federation. Its primary purpose is to modernize tournament operations, enhance player experience, and provide accurate, real-time data. Key capabilities include automated ELO rating calculation, secure player identification, and robust management of players, tournaments, match scoring, and rankings. The project aims to provide a future-proof platform ready for integration with external services like Firebase.

## User Preferences
I prefer all interfaces and data to be in Spanish.
I want the development to be iterative, focusing on critical features first before moving to integration with external services like Firestore.
Please ensure all critical features are fully implemented and tested with seed data before proceeding to the next development phase.
I prefer detailed explanations of architectural decisions.
I want to be asked before major architectural changes or external service integrations are made.
Do not make changes to the folder `shared/`.

## System Architecture
The system employs a client-server architecture.
-   **Frontend:** Built with React, Wouter for routing, TanStack Query for data fetching, and Tailwind CSS for styling. Shadcn UI and Lucide React icons are used for UI components.
-   **Backend:** Utilizes Express.js with an in-memory `MemStorage` for current data management, designed with an `IStorage` interface for future adaptability to different storage solutions.
-   **Database Schema:** Defined using Drizzle ORM, prepared for PostgreSQL, with TypeScript types.
-   **UI/UX Decisions:**
    -   **Language:** Entire interface and seed data are in Spanish.
    -   **Branding:** Uses "FPTM - Federación PR" branding, with roles renamed to Spanish.
    -   **Fonts:** Inter for general UI, JetBrains Mono for member numbers, scores, and ratings.
    -   **Color Scheme:** FPTM blue as primary, with green/yellow accents, white/light gray background. Full dark mode support planned.
    -   **Dashboard Styling:** Arbitro dashboard features gradient blue stat cards, responsive grid cards with hover effects, and FPTM-specific colored badges. Tournament listings are inspired by "Stadium Compete" design.
-   **Technical Implementations:**
    -   **Authentication System (Firebase):** Production-ready authentication using Firebase Auth with email/password and Google Sign-In. Key features:
        -   **Firebase Auth Integration:** Uses `onAuthStateChanged` for session persistence and automatic state management
        -   **Dual Registration Methods:** Email/password registration with full profile capture, and Google Sign-In for quick access
        -   **Automatic Member Number Generation:** Atomic counter using Firestore transactions (format: PRTTM-000001, PRTTM-000002, etc.)
        -   **User Profiles in Firestore:** Complete user data stored in `users` collection including uid, email, firstName, lastName, displayName, memberNumber, birthYear, club, role, rating, photoURL
        -   **Role-Based Access:** Supports 5 roles (owner, admin, arbitro, jugador, publico) with dynamic navigation and dashboards
        -   **Backward Compatibility:** Maintains localStorage integration for compatibility with existing matchStore system
        -   **Known Limitation:** Google Sign-In uses default birthYear (current year - 25) - future enhancement needed to capture actual birthYear post-registration
    -   **Mock Match Data:** Comprehensive match data structure with example matches in various states (scheduled, pending_result, pending_verification, verified, disputed, rejected).
    -   **Match Store (Firestore):** Complete migration to Firestore for match data management (`client/src/lib/firestoreMatchStore.ts`) with real-time subscriptions, atomic CRUD operations, and proper Timestamp conversions. Features:
        -   **Real-time Subscriptions:** Auto-updating dashboards for arbitros, jugadores, and admins via `subscribeToMatches`
        -   **Atomic Operations:** `saveMatchResult` (árbitro), `savePlayerResult` (jugador), `approveResult`, `rejectResult` with full validation
        -   **Data Integrity:** Proper status transitions, setsCount calculation, rating change storage, and verification metadata
        -   **Seed System:** `seedFirestore.ts` for loading mock data into Firestore with proper format conversion
        -   **Audit Trail:** Rejected results are preserved in `rejectedResult` field for auditing purposes
    -   **Notification System (Firestore):** Complete notification system for real-time alerts to players (`client/src/lib/notifications.ts`). Features:
        -   **Real-time Notifications:** Live notification bell in header with unread count badge
        -   **Result Rejection Alerts:** High-priority notifications sent to both players when admin rejects a result, directing them to Mesa Técnica
        -   **Verification Confirmations:** Normal-priority notifications sent when results are verified, showing rating changes
        -   **Action Required Indicators:** Visual badges for notifications requiring player action
        -   **Mark as Read:** Individual and bulk mark-as-read functionality
        -   **Firestore Collection:** Notifications stored in `notifications` collection with userId indexing for efficient queries
    -   **Dynamic Navigation:** Sidebar uses `useAuth` hook for role-specific menus and real-time badge counters for pending matches.
    -   **Match Scoring - Dual System:** Implemented for both referees (`/arbitro/match/:matchId`) and players (`/jugador/match/:matchId`).
        -   **Referee Scoring:** Marks matches as "verified" directly.
        -   **Player Scoring:** Marks matches as "pending_verification" requiring administrative approval.
        -   **Set Validation:** Automatic validation according to official table tennis rules (e.g., minimum 11 points, 2-point difference).
    -   **Birth Year Validation:** Critical component (`client/src/components/birth-year-validation.tsx`) integrated into scoring flow, requiring dual birth year validation for both players to prevent fraud.
    -   **Official FPTM Rating System:** Complete implementation of the 13-tier rating table based on rating differences. System automatically calculates and applies rating changes upon match verification. Key features:
        -   **13 Rating Tiers:** Ranges from 0-12 pts (±8) to 351+ pts (±25/-1).
        -   **Symmetric Equal Ratings:** When players have equal ratings (0-12 difference), winner always gets +8 and loser gets -8.
        -   **Upset Rewards:** Larger rating gains for underdog victories (e.g., 351+ difference: +25 for underdog win vs +1 for favorite win).
        -   **localStorage Persistence:** Match data including rating changes persists across page reloads and browser sessions.
        -   **Admin UI Integration:** Shows projected rating changes (blue/purple gradient) before approval and applied changes (green/blue gradient) after verification.
        -   **Detailed Toast Notifications:** Approval toasts display complete rating changes with old → new ratings for both players.
    -   **ATH Móvil Payment System:** Full workflow for manual admin verification of 5-character alphanumeric reference codes.
    -   **Multi-Event Tournament Registration:** Players can register for multiple events within a single tournament using checkbox selection, with validation and display in the admin interface.
    -   **Member Number Generation:** Automatic, auto-incrementing member numbers in the format `PRTTM-000001` using Firestore transaction-based counter for uniqueness under concurrency.
-   **System Design Choices:**
    -   **Modular Design:** Clear separation between `shared`, `server`, and `client` directories.
    -   **Full Firebase Integration:** Firebase Auth + Firestore for complete data persistence (users, matches). Backend uses in-memory `MemStorage` for tournaments/registrations (migration planned).
    -   **Transaction Safety:** Critical operations (member number generation) use Firestore transactions to guarantee data integrity under concurrent access.
    -   **Real-time Architecture:** Dashboards use Firestore's `onSnapshot` for live data updates without manual polling.

## External Dependencies
-   **Firebase:** Actively used for authentication (Firebase Auth) and user profile storage (Firestore). Configured services:
    -   **Firebase Auth:** Email/password authentication and Google OAuth provider
    -   **Firestore:** `users` collection for user profiles, `counters` collection for member number generation
    -   **Firebase Storage:** Configured but not yet actively used for profile photos
-   **ATH Móvil:** Integrated for payment processing.
-   **Shadcn UI:** Frontend component library.
-   **Lucide React:** Icon library.
-   **Wouter:** Lightweight React router.
-   **TanStack Query:** Data fetching and caching.
-   **Tailwind CSS:** Utility-first CSS framework.
-   **Express.js:** Backend web framework.
-   **Drizzle ORM:** Used for schema definition.