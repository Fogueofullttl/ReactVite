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
    -   **Authentication System (Mock):** React Context-based authentication using localStorage. Supports 4 roles (owner, admin, arbitro, jugador, publico) with dynamic navigation and role-based dashboards.
    -   **Mock Match Data:** Comprehensive match data structure with example matches in various states (scheduled, pending_result, pending_verification, verified, disputed, rejected).
    -   **Match Store (Global State System):** In-memory state management system (`client/src/lib/matchStore.ts`) with global reactivity via events for real-time updates across dashboards. Handles saving results by both referees and players, and approval/rejection by admins.
    -   **Dynamic Navigation:** Sidebar uses `useAuth` hook for role-specific menus and real-time badge counters for pending matches.
    -   **Match Scoring - Dual System:** Implemented for both referees (`/arbitro/match/:matchId`) and players (`/jugador/match/:matchId`).
        -   **Referee Scoring:** Marks matches as "verified" directly.
        -   **Player Scoring:** Marks matches as "pending_verification" requiring administrative approval.
        -   **Set Validation:** Automatic validation according to official table tennis rules (e.g., minimum 11 points, 2-point difference).
    -   **Birth Year Validation:** Critical component (`client/src/components/birth-year-validation.tsx`) integrated into scoring flow, requiring dual birth year validation for both players to prevent fraud.
    -   **ELO Rating System:** Implemented with a K-factor of 32, automatically updating player ratings and storing history upon match completion.
    -   **ATH Móvil Payment System:** Full workflow for manual admin verification of 5-character alphanumeric reference codes.
    -   **Multi-Event Tournament Registration:** Players can register for multiple events within a single tournament using checkbox selection, with validation and display in the admin interface.
    -   **Member Number Generation:** Automatic, auto-incrementing member numbers in the format `PRTTM-000123`.
-   **System Design Choices:**
    -   **Modular Design:** Clear separation between `shared`, `server`, and `client` directories.
    -   **Gradual Migration Strategy:** Intentional use of `MemStorage` with an `IStorage` interface to facilitate future migration to a persistent database like Firestore.
    -   **Role-Based Access (Mock):** Basic role-based authentication implemented with React Context and localStorage for dynamic navigation and dashboards, with future migration to Firebase Authentication planned.

## External Dependencies
-   **Firebase:** Configured for future integration, but not yet actively used for data storage or authentication.
-   **ATH Móvil:** Integrated for payment processing.
-   **Shadcn UI:** Frontend component library.
-   **Lucide React:** Icon library.
-   **Wouter:** Lightweight React router.
-   **TanStack Query:** Data fetching and caching.
-   **Tailwind CSS:** Utility-first CSS framework.
-   **Express.js:** Backend web framework.
-   **Drizzle ORM:** Used for schema definition.