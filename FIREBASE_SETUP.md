# Firebase Setup Guide

This guide will walk you through setting up Firebase for this project.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `fptm-tournament` (or your preferred name)
4. Disable Google Analytics (optional, but simpler for now)
5. Click "Create Project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Build** > **Authentication**
2. Click "Get started"
3. Click on "Email/Password" under Sign-in providers
4. Toggle "Enable" to ON
5. Click "Save"

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click "Create database"
3. Select "Start in production mode" (we'll use security rules)
4. Choose your region (select closest to your users)
5. Click "Enable"

## Step 4: Get Client-Side Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web icon** (</>)
4. Register your app with a nickname (e.g., "FPTM Web App")
5. Don't enable Firebase Hosting
6. Click "Register app"
7. Copy the firebaseConfig values

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxx"
};
```

## Step 5: Get Admin SDK Credentials

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click "Generate New Private Key"
3. Click "Generate Key" in the confirmation dialog
4. Save the downloaded JSON file as `firebase-admin-key.json` in your project root
5. **IMPORTANT:** Never commit this file to Git (it's already in .gitignore)

## Step 6: Create .env File

Create a `.env` file in the project root:

```bash
# Firebase Client Configuration (from Step 4)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxxxxxxxxxx

# Firebase Admin SDK (local development)
FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH=./firebase-admin-key.json

# Application Configuration
NODE_ENV=development
PORT=5000
```

Replace the values with your actual Firebase credentials from Steps 4 and 5.

## Step 7: Deploy Firestore Security Rules

Install Firebase CLI if you haven't already:
```bash
npm install -g firebase-tools
```

Login to Firebase:
```bash
firebase login
```

Initialize Firestore in your project:
```bash
firebase init firestore
```

When prompted:
- Select your Firebase project
- Accept default `firestore.rules` file
- Accept default `firestore.indexes.json` file

Deploy the security rules:
```bash
firebase deploy --only firestore:rules
```

## Step 8: Create Firestore Indexes

Some queries require composite indexes. Create them in Firebase Console:

1. Go to **Firestore Database** > **Indexes** tab

2. Create these composite indexes:

**Index 1: matches collection**
- Collection ID: `matches`
- Fields:
  - `tournamentId` (Ascending)
  - `roundNumber` (Ascending)
  - `matchNumber` (Ascending)
- Query scope: Collection

**Index 2: ratingHistory collection**
- Collection ID: `ratingHistory`
- Fields:
  - `playerId` (Ascending)
  - `createdAt` (Descending)
- Query scope: Collection

**Index 3: users collection (for rankings)**
- Collection ID: `users`
- Fields:
  - `role` (Ascending)
  - `rating` (Descending)
- Query scope: Collection

**Index 4: registrations collection**
- Collection ID: `registrations`
- Fields:
  - `tournamentId` (Ascending)
  - `paymentStatus` (Ascending)
- Query scope: Collection

Alternatively, wait for your app to make queries - Firebase will provide direct links to create missing indexes in the console errors.

## Step 9: Create Your First Admin User

You'll need to create the first admin user manually:

1. Run your application:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:5000/register` and create an account

3. In Firebase Console, go to **Firestore Database**

4. Find the `users` collection and your new user document

5. Edit the document and change the `role` field to `"admin"` or `"owner"`

6. Now you can log in with admin privileges!

## Step 10: Verify Everything Works

1. Start the application:
   ```bash
   npm run dev
   ```

2. Check the console for this message:
   ```
   ✓ Firebase Admin SDK initialized successfully
   ```

3. Go to `http://localhost:5000/login`

4. Try logging in with your admin account

5. You should be redirected to the admin dashboard

## Troubleshooting

### "Firebase Admin initialization failed"
- Check that `firebase-admin-key.json` exists in project root
- Verify the path in `.env` is correct
- Make sure the JSON file is valid

### "User profile not found"
- Make sure you created a user in Firestore (Step 9)
- Check that the `users` collection exists
- Verify the user document has required fields (email, role, etc.)

### "Permission denied" errors
- Deploy Firestore security rules (Step 7)
- Check that indexes are created (Step 8)
- Verify user has correct role in Firestore

### "Missing indexes" errors
- Create the composite indexes (Step 8)
- Or click the link in the error message to auto-create them

## Production Deployment

For production (Vercel, Netlify, etc.):

1. Add environment variables to your hosting platform:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

2. For the Admin SDK, use the JSON as an environment variable:
   ```
   FIREBASE_ADMIN_CREDENTIALS={"type":"service_account","project_id":"..."}
   ```

3. Don't upload `firebase-admin-key.json` to production servers

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] `firebase-admin-key.json` is in `.gitignore`
- [ ] Firestore security rules are deployed
- [ ] All indexes are created
- [ ] Admin user is created with correct role
- [ ] Test authentication flow works
- [ ] Test role-based access works

---

Need help? Check the [Firebase Documentation](https://firebase.google.com/docs) or open an issue on GitHub.
