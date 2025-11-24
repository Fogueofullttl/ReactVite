# FPTM - Sistema de Gestión de Torneos

## Overview
The FPTM Tournament Management System is designed to streamline the administration of table tennis tournaments for the Puerto Rican Table Tennis Federation. The project aims to provide a robust platform for managing players, tournaments, match scoring, and rankings. Key capabilities include automated ELO rating calculation, secure player identification through birth year validation, and a future-proof architecture ready for Firebase integration. The system's purpose is to modernize tournament operations, enhance player experience, and provide accurate, real-time data for FPTM members and the public.

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
-   **Backend:** Utilizes Express.js with an in-memory `MemStorage` for current data management, designed with a `IStorage` interface for future adaptability to different storage solutions.
-   **Database Schema:** Defined using Drizzle ORM, prepared for PostgreSQL, with TypeScript types.
-   **UI/UX Decisions:**
    -   **Language:** Entire interface and seed data are in Spanish.
    -   **Branding:** Uses "FPTM - Federación PR" branding, with roles renamed to Spanish.
    -   **Fonts:** Inter for general UI, JetBrains Mono for member numbers, scores, and ratings.
    -   **Color Scheme:** FPTM blue as primary, with green/yellow accents, white/light gray background. Full dark mode support planned.
    -   **Dashboard Styling:** Arbitro dashboard features gradient blue stat cards, responsive grid cards with hover effects, and FPTM-specific colored badges. Tournament listings are inspired by "Stadium Compete" design.
-   **Technical Implementations:**
    -   **Match Scoring:** Features a dedicated referee dashboard and scoring page (`/arbitro/match/:matchId`). Includes a form for up to 5 sets, with automatic validation for table tennis rules (11+ points, 2-point difference).
    -   **Birth Year Validation:** A critical component (`BirthYearValidation`) is integrated into the scoring process, requiring dual validation from players against their profiles before match confirmation.
    -   **ELO Rating System:** Implemented with a K-factor of 32, automatically updating player ratings upon match completion and storing a full history.
    -   **ATH Móvil Payment System:** Fully implemented with 5-character alphanumeric reference codes (últimos 5 del Reference Number), manual admin verification, and complete payment workflow (pending, verified, rejected). E2E tested successfully.
    -   **Member Number Generation:** Automatic, auto-incrementing member numbers in the format `PRTTM-000123`.
    -   **API Endpoints:** Structured for `/api/tournaments`, `/api/rankings`, `/api/matches`, and payment-related operations.
-   **System Design Choices:**
    -   **Modular Design:** Clear separation between `shared`, `server`, and `client` directories.
    -   **Gradual Migration Strategy:** Current use of `MemStorage` is intentional. The plan is to implement core FPTM logic first, then iteratively migrate to a persistent database (Firestore) using the `IStorage` interface.
    -   **Role-Based Access (Future):** Architecture is prepared for role-based dashboards and route protection (Owner, Admin, Árbitro, Jugador, Público) once Firebase Authentication is integrated.

## External Dependencies
-   **Firebase:** Configured (`client/src/lib/firebase.ts`) with Firestore helper functions (`client/src/lib/firestore-helpers.ts`) and secrets, but not yet actively integrated for data storage or authentication.
-   **ATH Móvil:** Integrated for payment processing, requiring manual verification of 5-character reference codes.
-   **Shadcn UI:** Frontend component library.
-   **Lucide React:** Icon library for the frontend.
-   **Wouter:** Lightweight React router.
-   **TanStack Query:** Data fetching and caching library for React.
-   **Tailwind CSS:** Utility-first CSS framework.
-   **Express.js:** Backend web framework.
-   **Drizzle ORM:** Used for schema definition, preparing for PostgreSQL.