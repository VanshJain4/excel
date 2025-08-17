# Firebase Setup Guide (Free Version - No Storage Required)

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "skopeo-ai" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add your authorized domain (localhost for development)

## 3. Enable Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to you

## 4. Get Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Register app with name "skopeo-ai-web"
5. Copy the config object

## 5. Update Configuration

Replace the placeholder config in `src/firebase/config.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 6. Firestore Security Rules

Update your Firestore rules to allow file storage (for development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /files/{fileId} {
      allow read, write: if true;  // For development - allows all access
    }
  }
}
```

**For production, use this more secure version:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /files/{fileId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 7. Create Required Index

**IMPORTANT**: You need to create a composite index for the files query:

1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Collection: `files`
4. Fields: 
   - `userId` (Ascending)
   - `createdAt` (Descending)
5. Click "Create"

**Or click this direct link**: https://console.firebase.google.com/v1/r/project/skopeo-ai/firestore/indexes?create_composite=Ckdwcm9qZWN0cy9za29wZW8tYWkvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2ZpbGVzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI

## 8. How It Works (Base64 Storage)

This system stores files as base64 strings directly in Firestore, which is:
- ✅ **Completely Free** - No Firebase Storage required
- ✅ **Simple** - All data in one place
- ✅ **Real-time** - Changes sync instantly
- ⚠️ **Size Limit** - Firestore has 1MB document limit

**Note**: For larger files (>1MB), you might need to consider Firebase Storage (paid) or chunking files.

## 9. Test the Setup

1. Run `npm start` in the auth-interface directory
2. Try logging in with Google
3. Try uploading a file (will be stored as base64 in Firestore)
4. Check if files appear in Firebase Console → Firestore Database

## 10. File Storage Details

Files are stored in Firestore with this structure:
```javascript
{
  userId: "user-id",
  fileName: "spreadsheet.xlsx",
  fileSize: 12345,
  mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  fileContent: "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UklGRiQAAABX...",
  createdAt: timestamp,
  updatedAt: timestamp,
  storageType: "firestore-base64"
}
```

## 11. Troubleshooting

**If you see "The query requires an index" error:**
- Create the composite index as described in step 7
- Wait a few minutes for the index to build

**If you see CORS errors:**
- Make sure you're using the correct Firebase config
- Check that the domain is authorized in Firebase Console

**If files don't appear after upload:**
- Check Firestore rules (should allow read/write)
- Check browser console for errors
- Verify the index is created and built
