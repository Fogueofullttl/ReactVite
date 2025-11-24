# Table Tennis Tournament Management System - Design Guidelines

## Design Approach: Tailwind CSS + Athletic Utility Design

**Rationale**: Sports management platform requiring clarity, efficiency, and data-heavy interfaces. Drawing inspiration from **Linear** (clean data presentation), **Notion** (role-based views), and athletic platforms like **Strava** (stats/rankings focus).

## Core Design Principles

1. **Role Clarity**: Visual differentiation for Owner, Admin, Referee, Player, Public views
2. **Data Hierarchy**: Tournament brackets, rankings, and match results as primary focus
3. **Action-Oriented**: Clear CTAs for registration, score entry, tournament creation
4. **Real-time Updates**: Visual feedback for live tournament progression

---

## Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - clean, readable for data tables and forms
- Monospace: JetBrains Mono - for member numbers (PRTTM-000123), match scores

**Hierarchy**:
- Page Titles: text-3xl font-bold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Small Labels: text-sm font-medium
- Table Data: text-sm font-normal
- Match Scores: text-4xl font-bold (monospace)

---

## Layout System

**Spacing Units**: Use Tailwind units of **2, 4, 8, 12, 16** (p-2, m-4, gap-8, py-12, px-16)

**Container Strategy**:
- Dashboard layouts: Full-width with max-w-7xl centered
- Forms: max-w-2xl centered
- Tournament brackets: Full-width scrollable
- Data tables: max-w-6xl

**Grid Patterns**:
- Tournament cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Player stats: grid-cols-2 md:grid-cols-4
- Match pairings: grid-cols-1 gap-4

---

## Component Library

### Navigation
- **Sidebar Navigation** (Desktop): Fixed left sidebar with role-based menu items, icon + label format using Lucide icons
- **Mobile Navigation**: Bottom navigation bar with primary actions
- **Top Bar**: User profile, notifications bell, membership status badge

### Dashboard Cards
- Tournament overview cards with status badges (Active, Completed, Upcoming)
- Player stat cards: Matches played, Win rate, Current ranking
- Raised cards with subtle shadow (shadow-sm), border (border border-gray-200)

### Forms & Inputs
- Consistent input styling: border, rounded-lg, p-3, focus:ring-2
- Form sections grouped with clear labels above inputs
- Photo upload with drag-drop zone and preview
- Date/time pickers with calendar icon
- Payment code input: 5-character monospace uppercase field

### Tournament Brackets
- **Group Stage**: Table format with match results grid
- **Elimination Bracket**: Tree structure with connecting lines, match boxes showing player names + scores
- Visual progression: completed matches slightly muted, active matches highlighted
- Responsive: Horizontal scroll on mobile, full tree on desktop

### Tables
- Striped rows (even:bg-gray-50) for rankings and player lists
- Sortable headers with arrow icons
- Sticky header on scroll for long lists
- Row hover states for interactivity

### Badges & Status Indicators
- Membership Status: Active (green), Expired (red), Pending (yellow)
- Tournament Status: Open, In Progress, Completed
- Payment Status: Verified, Pending
- Role badges: Different border accent for each role type

### Match Score Entry
- Large score input fields (text-4xl) for referee input
- Dual validation UI: Two birth year input fields side-by-side
- Submit button only enabled after both validations
- Success/error toast notifications

### Modals & Overlays
- Tournament registration modal with multi-step form
- Match result confirmation dialog
- Player profile quick view
- Semi-transparent backdrop (backdrop-blur-sm)

---

## Key Page Layouts

### Public Landing Page
- **Hero Section**: Full-width banner with tournament action photo, "Join Puerto Rico's Premier Table Tennis Community" headline, CTA buttons
- **Featured Tournaments**: 3-column grid of upcoming tournaments
- **Rankings Leaderboard**: Top 10 players with photos and ratings
- **How It Works**: 4-step process with icons
- **Footer**: Contact info, quick links, social media

### Dashboard (Role-Based)
- **Player Dashboard**: Upcoming matches, registration status, personal stats, rating history graph
- **Referee Dashboard**: Assigned matches, score entry quick actions, recent submissions
- **Admin Dashboard**: Tournament management, pending registrations, payment verifications
- **Owner Dashboard**: System analytics, user management, all tournaments overview

### Tournament Detail Page
- Tournament header: Title, date, venue, registration deadline countdown
- Tabs: Overview, Registered Players, Bracket/Draw, Results, Standings
- Registration CTA prominent if open
- Live bracket view with real-time updates

### Player Profile
- Profile photo (circular, large), member number, club affiliation
- Stats grid: Total matches, win rate, current ranking
- Rating history chart
- Match history table
- Edit profile button (own profile only)

---

## Images

**Hero Image**: 
- Placement: Landing page hero section, full-width, height: 60vh
- Description: Dynamic action shot of table tennis match - player mid-serve or intense rally, professional photography with motion blur, indoor tournament setting with bright lighting
- Treatment: Subtle gradient overlay from bottom for text readability

**Profile Photos**:
- Circular avatars throughout (rankings, match brackets, player cards)
- Fallback: Initials on solid background if no photo uploaded

**Tournament Cards**:
- Optional: Small venue/location photos as card backgrounds (with overlay)
- Default: Icon-based cards with category indicators

---

## Interactions & States

**Minimal Animations**:
- Page transitions: Simple fade-in
- Form submission: Loading spinner on button
- Bracket updates: Gentle highlight flash for new results
- No scroll animations, parallax, or decorative effects

**Button States**:
- Primary CTA: Solid background, hover:brightness-110, disabled:opacity-50
- Secondary: Outlined, hover:bg-gray-50
- Danger (forfeit/delete): Red variant with confirmation

**Loading States**:
- Skeleton screens for data tables and tournament brackets
- Spinner for form submissions
- Progressive loading for large player lists

---

## Accessibility

- Semantic HTML for all forms and tables
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels for icon-only buttons
- Keyboard navigation for bracket traversal
- Focus indicators on all interactive elements
- High contrast ratios for text (WCAG AA minimum)
- Form error messages associated with inputs

---

## Responsive Breakpoints

- Mobile (< 768px): Single column, bottom nav, simplified brackets
- Tablet (768px - 1024px): 2-column grids, sidebar collapses
- Desktop (> 1024px): Full layouts, permanent sidebar, multi-column data views