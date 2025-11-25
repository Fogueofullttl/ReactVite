# FPTM - Sistema de Gestión de Torneos

## Overview
The FPTM Tournament Management System is designed to streamline the administration of table tennis tournaments for the Puerto Rican Table Tennis Federation. The project aims to provide a robust platform for managing players, tournaments, match scoring, and rankings. Key capabilities include automated ELO rating calculation, secure player identification through birth year validation, and a future-proof architecture ready for Firebase integration. The system's purpose is to modernize tournament operations, enhance player experience, and provide accurate, real-time data for FPTM members and the public.

## Recent Changes (November 25, 2025)
-   **Sistema de Autenticación Mock (FASE 1):** Implementado sistema completo de login y gestión de roles usando React Context y localStorage. Incluye 4 usuarios de prueba (admin@fptm.pr, arbitro@fptm.pr, jugador@fptm.pr, owner@fptm.pr), página de login con selector de roles, navegación dinámica según rol autenticado, y actualización del sidebar para mostrar información del usuario. Sidebar incluye botón de logout y menús específicos por rol. E2E testing confirmó flujo correcto de login/logout y redirección para todos los roles.
-   **Dashboard de Árbitro con Datos Mock:** Creado dashboard completo para árbitros (`/arbitro/dashboard`) con datos mock de partidos. Incluye 3 tarjetas de estadísticas (Pendientes, Completados Hoy, Total Arbitrados) con gradiente azul/verde/morado, tabs para Pendientes/Completados, componente MatchCard reutilizable con avatares de jugadores, ratings, y badges de stage/mesa. Datos mock incluyen 4 partidos de ejemplo asignados a arbitro-001 (3 pendientes, 1 completado).
-   **Multi-Event Tournament Registration:** Implemented complete system for players to select multiple events when registering for tournaments. Schema updated with `events: text().array()` in both tournaments and registrations, UI uses checkboxes for event selection, backend validates array presence, and admin can view selected events as badges. Critical bug resolved where Zod `.transform()` was interfering with react-hook-form serialization; fixed by moving transform to manual `onSubmit` handler. E2E tested and confirmed working.
-   **Sistema de Scoring de Partidos (COMPLETO):** Implementada página completa `/arbitro/match/:matchId` con funcionalidad crítica de ingreso de resultados. Incluye: (1) Formulario de 5 sets con validación automática según reglas oficiales de tenis de mesa (mínimo 11 puntos, diferencia de 2, validación especial para deuce), (2) Feedback visual inmediato (border verde para sets válidos, rojo para inválidos, badges con ganador de cada set), (3) Detección automática del ganador del partido (Best of 5), (4) Integración completa con componente BirthYearValidation para validación dual de identidad antes de confirmar, (5) matchStore (`client/src/lib/matchStore.ts`) para gestión de estado de partidos en memoria con persistencia de resultados (sets, ganador, timestamps, validatedBy, observaciones), (6) Dashboard actualizado con estado reactivo usando useState/useEffect para reflejar partidos completados automáticamente, (7) Flujo completo testeado E2E: login → dashboard → seleccionar partido → ingresar sets → validar jugadores → confirmar → dashboard actualizado mostrando partido completado con estadísticas actualizadas.

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
    -   **Authentication System (FASE 1 - Mock):** React Context-based authentication (`client/src/contexts/AuthContext.tsx`) using localStorage. Supports 4 roles (owner, admin, arbitro, jugador, publico) with dynamic navigation and role-based dashboards. Login page (`/login`) includes email, password, and role selector. Each role redirects to appropriate dashboard: árbitro → `/arbitro/dashboard`, admin → `/admin/registrations`, owner → `/owner`, jugador → `/`. No real backend authentication yet; preparation for Firebase Auth integration.
    -   **Mock Match Data:** Created `client/src/data/mockMatches.ts` with sample match data structure (Match, MatchPlayer, MatchResult types). Includes 4 example matches assigned to arbitro-001, with 3 pending, 1 completed. Uses dicebear.com for player avatars. Designed for development/testing before real match management implementation. Managed by matchStore for state updates.
    -   **Match Store:** Sistema de gestión de estado (`client/src/lib/matchStore.ts`) que mantiene partidos en memoria. Funciones: getMatches(), getMatch(id), updateMatch(id, updates), saveMatchResult(matchId, sets, winnerId, enteredBy, observations). Persiste resultados con estructura completa y actualiza status de "pending" a "completed". Diseñado para facilitar migración futura a backend real.
    -   **Match Card Component:** Reusable `MatchCard` component displays match information with player avatars, ratings, stage/mesa badges, and conditional rendering for pending (with "Ingresar Resultado" button) vs completed matches (with set scores and winner). Used in arbitro dashboard.
    -   **Arbitro Dashboard:** Complete dashboard at `/arbitro/dashboard` with gradient stat cards (blue/green/purple), tabs for Pendientes/Completados, filtered by referee ID from auth context. Shows match cards using mock data, calculates "Completados Hoy" dynamically.
    -   **Dynamic Navigation:** Sidebar (`app-sidebar.tsx`) uses `useAuth` hook to display role-specific menus. Arbitro sees "Mis Partidos" + "Torneos"; Admin sees dashboard/users/payments; Owner sees analytics/settings; Jugador sees panel/tournaments/matches/profile. Includes logout button and user info display with avatar, member number, and role badge.
    -   **Match Scoring (COMPLETO):** Sistema completo de ingreso de resultados en `/arbitro/match/:matchId`. Formulario Best of 5 sets con validación automática de reglas oficiales (mínimo 11 puntos, diferencia de 2, si >11 entonces diferencia exacta de 2, si un jugador tiene 11 el oponente debe tener ≤9). Feedback visual inmediato con colores (verde=válido, rojo=inválido), badges de ganador por set, panel de resumen con contador de sets y ganador del partido. Integra BirthYearValidation para verificación dual de identidad. matchStore gestiona persistencia en memoria con estructura completa: sets array, winner, validatedBy, enteredBy, enteredAt, observations. Dashboard se actualiza automáticamente mostrando partidos completados con resultados. E2E tested exitosamente.
    -   **Birth Year Validation:** Componente crítico (`client/src/components/birth-year-validation.tsx`) integrado en flujo de scoring. Requiere validación dual de año de nacimiento de ambos jugadores antes de confirmar resultado. Input de 4 dígitos con feedback visual (CheckCircle/XCircle), tracking de intentos, y callback onAllValidated. Diseñado para prevenir fraude en ingreso de resultados.
    -   **ELO Rating System:** Implemented with a K-factor of 32, automatically updating player ratings upon match completion and storing a full history.
    -   **ATH Móvil Payment System:** Fully implemented with 5-character alphanumeric reference codes (últimos 5 del Reference Number), manual admin verification, and complete payment workflow (pending, verified, rejected). E2E tested successfully.
    -   **Multi-Event Tournament Registration:** Players can register for multiple events within a single tournament (Singles Masculino, Singles Femenino, Dobles Mixtos, etc.). Implemented with checkbox selection, minimum one event validation, array persistence in database, and badge display in admin interface. E2E tested successfully.
    -   **Member Number Generation:** Automatic, auto-incrementing member numbers in the format `PRTTM-000123`.
    -   **API Endpoints:** Structured for `/api/tournaments`, `/api/rankings`, `/api/matches`, and payment-related operations.
-   **System Design Choices:**
    -   **Modular Design:** Clear separation between `shared`, `server`, and `client` directories.
    -   **Gradual Migration Strategy:** Current use of `MemStorage` is intentional. The plan is to implement core FPTM logic first, then iteratively migrate to a persistent database (Firestore) using the `IStorage` interface.
    -   **Role-Based Access (FASE 1 - Mock):** Basic role-based authentication implemented with React Context and localStorage. Supports 5 roles with dynamic navigation and dashboards. Mock users for testing: admin@fptm.pr, arbitro@fptm.pr (ID: arbitro-001), jugador@fptm.pr, owner@fptm.pr (all use password: password123). Future migration to Firebase Authentication planned.

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