# FPTM - Federación Puertorriqueña de Tenis de Mesa

A modern tournament management system for the Puerto Rico Table Tennis Federation, built with React, TypeScript, Vite, and Firebase/Firestore.

## 🏓 Features

- **User Management** - Role-based access control (Owner, Admin, Arbitro, Jugador, Publico)
- **Tournament Management** - Create, manage, and track tournaments
- **Registration System** - Player registration with ATH Móvil payment verification
- **Match Scoring** - Real-time match scoring with referee and player validation
- **ELO Rating System** - Automatic rating calculations and history tracking
- **Rankings** - Player rankings and rating history
- **Real-time Updates** - Powered by Firebase/Firestore
- **Responsive Design** - Beautiful UI with Tailwind CSS and shadcn/ui

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **React Hook Form + Zod** - Form handling and validation
- **Firebase Auth** - Authentication

### Backend
- **Express** - API server
- **Firebase Admin SDK** - Server-side Firebase operations
- **Firestore** - Database (NoSQL)
- **TypeScript** - Type safety

## 📋 Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Firebase Project** - [Create one here](https://console.firebase.google.com/)

## 🛠️ Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd ReactVite
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Firebase Configuration

#### A. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Create a **Firestore Database**

#### B. Get Firebase Client Credentials

1. Go to Project Settings > General
2. Under "Your apps", select Web app
3. Copy your config values

#### C. Get Firebase Admin SDK Credentials

1. Go to Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Save it as `firebase-admin-key.json` in the project root

### 4. Environment Variables

Create a `.env` file in the project root:

\`\`\`bash
# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Firebase Admin SDK
FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH=./firebase-admin-key.json

# Server Configuration
NODE_ENV=development
PORT=5000
\`\`\`

### 5. Firestore Security Rules

Deploy the security rules to Firebase:

\`\`\`bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
\`\`\`

The rules file is located at `firestore.rules` and includes:
- Role-based access control
- User profile protection
- Tournament and match access rules
- Immutable rating history

### 6. Firestore Indexes

Create the following composite indexes in Firestore console:

1. **Collection: matches**
   - tournamentId (Ascending) + roundNumber (Ascending) + matchNumber (Ascending)

2. **Collection: ratingHistory**
   - playerId (Ascending) + createdAt (Descending)

3. **Collection: users**
   - role (Ascending) + rating (Descending)

### 7. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at `http://localhost:5000`

## 📁 Project Structure

\`\`\`
/home/user/ReactVite/
├── client/src/              # React frontend
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   └── ProtectedRoute.tsx  # Route guards
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and Firebase config
│   │   ├── firebase.ts     # Firebase client initialization
│   │   └── firebaseHelpers.ts  # Firestore helper functions
│   ├── pages/              # Page components (organized by role)
│   └── main.tsx            # App entry point
├── server/                  # Express backend
│   ├── app.ts              # Express configuration
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Firestore storage layer
│   ├── firebaseAdmin.ts    # Firebase Admin SDK
│   └── index-dev.ts        # Dev server entry
├── shared/                  # Shared TypeScript types
│   └── schema.ts           # Data models and validation
├── firestore.rules         # Firestore security rules
├── .env.example            # Environment variable template
└── package.json            # Dependencies and scripts
\`\`\`

## 🔒 Security

### Authentication
- Firebase Authentication for secure user management
- Email/password authentication
- Secure session management
- No localStorage for sensitive data

### Authorization
- Role-based access control (RBAC)
- Protected routes on frontend
- Firestore security rules on backend
- Server-side validation with Firebase Admin SDK

### Data Protection
- Firestore security rules enforce:
  - Users can only edit their own profiles
  - Only admins can create/modify tournaments
  - Match updates restricted to referees and participants
  - Rating history is immutable

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run
\`\`\`

## 🏗️ Build for Production

\`\`\`bash
# Build both client and server
npm run build

# Start production server
npm start
\`\`\`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update user profile
- `GET /api/users/rankings` - Get player rankings

### Tournaments
- `GET /api/tournaments` - List all tournaments
- `POST /api/tournaments` - Create tournament (Admin only)
- `GET /api/tournaments/:id` - Get tournament details
- `PATCH /api/tournaments/:id` - Update tournament (Admin only)

### Registrations
- `POST /api/tournaments/:id/register` - Register for tournament
- `GET /api/tournaments/:id/registrations` - Get tournament registrations
- `PATCH /api/registrations/:id/verify` - Verify payment (Admin only)

### Matches
- `GET /api/tournaments/:id/matches` - Get tournament matches
- `POST /api/matches` - Create match (Admin only)
- `PATCH /api/matches/:id` - Update match score
- `POST /api/matches/:id/validate` - Validate match result

### Ratings
- `GET /api/users/:id/rating-history` - Get player rating history

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/):
- Buttons, Inputs, Forms
- Cards, Dialogs, Dropdowns
- Tables, Tabs, Toasts
- And 40+ more components

## 🚧 Recent Improvements

### Architecture
- ✅ **Migrated from in-memory storage to Firestore** - Persistent database
- ✅ **Removed unused dependencies** - Removed PostgreSQL, Drizzle ORM, Passport, react-router-dom
- ✅ **Firebase Admin SDK integration** - Secure server-side operations
- ✅ **Firestore security rules** - Comprehensive data protection

### Code Quality
- ✅ **Removed localStorage hacks** - Proper state management with React Context
- ✅ **Fixed setTimeout navigation** - Async/await patterns
- ✅ **TypeScript improvements** - Reduced 'any' types
- ✅ **Protected routes** - Role-based route guards
- ✅ **Proper error handling** - Custom error classes and error boundaries

### Developer Experience
- ✅ **Environment variable documentation** - .env.example file
- ✅ **Improved .gitignore** - Better file exclusions
- ✅ **Test infrastructure** - Vitest + React Testing Library
- ✅ **Comprehensive README** - Setup and usage documentation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT

## 👥 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for the Puerto Rico Table Tennis Federation
