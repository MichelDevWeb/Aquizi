# Firebase Setup for Aquizi

This guide will help you set up Firebase Authentication and Firestore for the Aquizi application.

## Prerequisites

1. A Google account
2. Node.js and npm installed on your machine

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "Aquizi")
4. Follow the prompts to set up your project
5. Once your project is created, you'll be taken to the project dashboard

## Step 2: Set Up Firebase Authentication

1. In the Firebase Console, navigate to "Authentication" in the left sidebar
2. Click "Get started"
3. In the "Sign-in method" tab, enable "Google" as a sign-in provider
4. Configure the Google sign-in provider with your OAuth credentials
   - You may need to create a new OAuth client ID in the Google Cloud Console
   - Set the authorized domain to your application's domain

## Step 3: Set Up Firestore Database

1. In the Firebase Console, navigate to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (for development)
4. Select a location for your database
5. Click "Enable"

## Step 4: Get Your Firebase Configuration

1. In the Firebase Console, click on the gear icon next to "Project Overview" and select "Project settings"
2. Scroll down to the "Your apps" section
3. Click on the web app icon (</>) to add a web app if you haven't already
4. Enter a nickname for your app (e.g., "Aquizi Web")
5. Register the app
6. Copy the Firebase configuration object

## Step 5: Set Up Environment Variables

Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Step 6: Set Up Firestore Security Rules

1. In the Firebase Console, navigate to "Firestore Database" in the left sidebar
2. Click on the "Rules" tab
3. Update the rules to secure your database:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read and write their own todos
    match /todos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Step 7: Install Firebase SDK

Run the following command to install the Firebase SDK:

```bash
npm install firebase
```

## Step 8: Test Your Firebase Integration

1. Start your development server:

```bash
npm run dev
```

2. Navigate to your application
3. Test the authentication flow by signing in with Google
4. Verify that user data is being stored in Firestore

## Troubleshooting

- If you encounter CORS issues, make sure your domain is added to the authorized domains in the Firebase Authentication settings.
- If you're having issues with authentication, check the browser console for error messages.
- If Firestore operations are failing, check your security rules to ensure they allow the operations you're trying to perform.

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Web SDK Reference](https://firebase.google.com/docs/reference/js) 