# Google OAuth Setup Instructions

## Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"

## Step 2: Configure OAuth Consent Screen
1. Click on "OAuth consent screen" tab
2. Select "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name
   - User support email
   - Developer contact information
4. Add the scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`
5. Add your test users (your email)
6. Save and continue

## Step 3: Create OAuth Client ID
1. Click on "Credentials" tab
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add a name for your OAuth client
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production URL when ready
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - Your production callback URL when ready
7. Click "Create"

## Step 4: Set Environment Variables
1. Copy your Client ID and Client Secret
2. Update the following files with your credentials:

### Backend (.env file)
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=your-random-secret-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env file)
```
VITE_GOOGLE_CLIENT_ID=your-client-id
```

## Step 5: Start Your Application
1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `npm run dev`
3. Navigate to the login page and test the Google login functionality

## Troubleshooting
- Make sure your redirect URIs exactly match what's configured in Google Cloud Console
- Check browser console for any errors
- Verify that all environment variables are correctly set
- Ensure you've added yourself as a test user in the OAuth consent screen