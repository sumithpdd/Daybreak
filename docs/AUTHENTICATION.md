# Authentication Setup

This guide covers setting up Google OAuth authentication with NextAuth.js for the My Kanban Task Management App.

## Why Google Authentication?

We use Google OAuth for several important reasons:

- **Security**: Google handles password security, 2FA, and account protection, reducing the burden on our application
- **User Experience**: Users don't need to create another account or remember new passwords, leading to a smoother onboarding process
- **Trust**: Users generally trust Google with their credentials more than individual applications
- **Data Access**: We can securely access verified user information (name, email, profile picture) from Google, which can be used to personalize the user experience
- **Scalability**: We don't need to manage user accounts, password resets, or email verification systems, allowing us to focus on core application features
- **Compliance**: Google handles many aspects of data privacy (e.g., GDPR) and security standards, simplifying compliance efforts

## Authentication Flow

1. User clicks "Sign in with Google" within our application
2. The user is redirected to Google's secure login page
3. The user authenticates with their Google account
4. Google redirects back to our application with user data and an authorization code
5. NextAuth.js processes this information and creates a secure session for the user
6. The user is successfully logged into the Kanban app and redirected to the main application interface

## Step-by-Step Setup

### 1. Install NextAuth.js

```bash
npm install next-auth
```

### 2. Create Authentication API Routes

Create the following folder structure:
```
src/app/api/auth/[...nextauth]/
├── route.ts
└── options.ts
```

**Configure Google OAuth provider** (`src/app/api/auth/[...nextauth]/options.ts`):
```typescript
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see what's happening
};
```

**Create API handler** (`src/app/api/auth/[...nextauth]/route.ts`):
```typescript
import NextAuth from "next-auth";
import { options } from "./options";

const handler = NextAuth(options);

export { handler as GET, handler as POST };
```

### 3. Set Up Google OAuth Credentials

**Step 1**: Go to [Google Cloud Console](https://console.cloud.google.com/) and sign in

**Step 2**: Enable Google+ API
- Navigate to **APIs & Services** → **Library**
- Search for "Google+ API" or "Google OAuth2 API"
- Click on it and enable it

**Step 3**: Configure OAuth Consent Screen
- Go to **APIs & Services** → **OAuth consent screen**
- Choose **External** (unless you have a Google Workspace)
- Fill in the required fields:
  - App name: "My Kanban Task Management App"
  - User support email: your email
  - Developer contact: your email
- Add scopes: `email`, `profile`, `openid`
- Add test users (your email) if in testing mode

**Step 4**: Create OAuth 2.0 Credentials
- Go to **APIs & Services** → **Credentials**
- Click **+ CREATE CREDENTIALS** → **OAuth client ID**
- Choose **Web application**
- Set **Authorized redirect URIs** (must be exactly this):
  ```
  http://localhost:3000/api/auth/callback/google
  ```
  **Important**:
  - Use `http://` (not `https://`) for localhost
  - Port must be `3000`
  - Path must be exactly `/api/auth/callback/google`
  - No trailing slashes or extra characters
- Click **Create**
- Copy the **Client ID** and **Client Secret**

### 4. Set Up Environment Variables

Create a `.env.local` file in the project root:
```env
# Google OAuth Credentials for NextAuth.js
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_generated_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 5. Generate NextAuth Secret

**IMPORTANT**: You must generate your own unique `NEXTAUTH_SECRET`. Never use a hardcoded secret from documentation.

**Method 1: Using the provided script (Easiest)**
```bash
node generate-secret.js
```

**Method 2: Using Node.js directly**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3: Using OpenSSL (if available)**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows with Git installed
"C:\Program Files\Git\usr\bin\openssl.exe" rand -base64 32
```

**Security Note**: This secret is used to encrypt session tokens and other sensitive data. Keep it secure and never commit it to version control.

### 6. Create Middleware for Protected Routes

Create `src/middleware.ts`:
```typescript
export { default } from 'next-auth/middleware'

export const config = { matcher: ['/'] }
```

### 7. Verify Authentication Setup

**Test the authentication**:
- Run `npm run dev`
- Visit `http://localhost:3000`
- You should be redirected to Google sign-in
- After successful login, you'll be redirected back to your app
- Check the terminal for debug logs showing successful authentication

## Common Issues & Solutions

**Issue**: `redirect_uri_mismatch` error
- **Solution**: Ensure the redirect URI in Google Cloud Console is exactly: `http://localhost:3000/api/auth/callback/google`
- Check for typos, wrong protocol (use `http://` not `https://`), wrong port, or extra characters

**Issue**: `NEXTAUTH_URL` warning
- **Solution**: Add `NEXTAUTH_URL=http://localhost:3000` to your `.env.local` file

**Issue**: Environment variables not loading
- **Solution**: Ensure `.env.local` is in the project root and restart the development server

**Issue**: Authentication not working
- **Solution**: 
  1. Verify your Google OAuth credentials are correct
  2. Check that the OAuth consent screen is properly configured
  3. Ensure the redirect URI matches exactly
  4. Restart the development server after making changes

**Debug Mode**: The `debug: true` option in `options.ts` provides detailed logs to help troubleshoot authentication issues.

## What Happens After Successful Authentication

When a user successfully signs in with Google, NextAuth.js:

1. **Creates a secure session** with encrypted session tokens
2. **Stores user data** including name, email, and profile picture
3. **Sets authentication cookies** for maintaining login state
4. **Redirects to the main app** where users can start using the Kanban board
5. **Provides session data** that can be accessed throughout the app using `useSession()` hook

**Session Data Available**:
```typescript
{
  user: {
    name: "John Doe",
    email: "john.doe@gmail.com",
    image: "https://lh3.googleusercontent.com/..."
  },
  expires: "2024-01-15T10:30:00.000Z" // Example expiration date
}
```

## Next Steps

After setting up authentication:

1. **Test the login flow** to ensure everything works
2. **Set up Redux store** for state management
3. **Create UI components** for the Kanban interface
4. **Integrate Firebase** for data persistence
5. **Implement CRUD operations** for boards and tasks

---

*For the complete setup guide, see [Getting Started](GETTING_STARTED.md)*
