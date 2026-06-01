# Deployment Guide: Making Your App Public

Complete guide to deploying the MyKanban application to production.

---

## 🎯 Deployment Options

### Option 1: Vercel (Recommended) ⭐
- **Best for**: Next.js applications (built by the Next.js team)
- **Pros**: Zero configuration, automatic HTTPS, great performance, free tier
- **Time**: 10-15 minutes
- **Perfect for this app!**

### Option 2: Firebase Hosting + Cloud Functions
- **Best for**: If you want everything in Firebase
- **Pros**: Unified Firebase ecosystem
- **Cons**: More complex setup, requires Cloud Functions
- **Time**: 30-45 minutes

We'll cover both options below.

---

## 🚀 Option 1: Deploy to Vercel (Recommended)

Vercel is the best platform for Next.js apps - it's built by the same team!

### Step 1: Prepare Your App

**1.1: Create Production Environment Variables**

Create a file documenting your production environment variables (but don't commit it!):

```bash
# Create a reference file (add to .gitignore)
cp .env.local .env.production.example
```

Edit `.env.production.example` and replace with production URLs:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret

# NextAuth (generate new secret for production!)
NEXTAUTH_SECRET=your_production_nextauth_secret
NEXTAUTH_URL=https://your-app-name.vercel.app

# Firebase Production
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-prod-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Lexical
```

**1.2: Test Production Build Locally**

```bash
# Build for production
npm run build

# Test production build
npm run start
```

Open http://localhost:3000 and verify everything works!

### Step 2: Set Up Production Google OAuth

**2.1: Update OAuth Redirect URIs**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
5. Click "Save"

**Note**: You'll update `your-app-name` after deploying to Vercel.

### Step 3: Deploy to Vercel

**3.1: Sign Up for Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended)

**3.2: Import Your Project**

1. Click "Add New..." → "Project"
2. Import your Git repository
3. Or use Vercel CLI (see below)

**3.3: Configure Build Settings**

Vercel auto-detects Next.js projects. Verify these settings:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**3.4: Add Environment Variables**

In Vercel dashboard:

1. Go to "Settings" → "Environment Variables"
2. Add each variable from your `.env.production.example`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (use: `https://your-project.vercel.app`)
   - All `NEXT_PUBLIC_FIREBASE_*` variables

3. Click "Deploy"

**3.5: Deploy!**

Click "Deploy" and wait 2-3 minutes.

Your app will be live at: `https://your-project-name.vercel.app`

### Step 4: Update OAuth Redirect URL

1. Copy your Vercel app URL (e.g., `https://mykanban.vercel.app`)
2. Go back to Google Cloud Console
3. Update OAuth redirect URI:
   ```
   https://mykanban.vercel.app/api/auth/callback/google
   ```
4. Update `NEXTAUTH_URL` in Vercel environment variables
5. Redeploy in Vercel

### Step 5: Update Firestore Security Rules

Deploy production security rules:

```bash
# Use production rules
firebase deploy --only firestore:rules --project production
```

Use `firestore.prod.rules` for production.

### Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Click "Sign In with Google"
3. Verify authentication works
4. Create a board
5. Add a task
6. Test all features!

---

## 🔥 Option 2: Deploy to Firebase Hosting

Firebase Hosting can serve Next.js, but requires Firebase Cloud Functions for server-side features.

### Prerequisites

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### Step 1: Initialize Firebase Hosting

```bash
# In your project directory
firebase init hosting

# Choose options:
# - Use existing project: select your Firebase project
# - Public directory: out
# - Configure as single-page app: No
# - Set up automatic builds: No
# - Overwrite index.html: No
```

### Step 2: Configure for Next.js Export

**2.1: Update `next.config.ts`**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // Enable static export
  images: {
    unoptimized: true,  // Required for static export
  },
  trailingSlash: true,  // Better for static hosting
};

export default nextConfig;
```

**⚠️ WARNING**: Static export has limitations:
- No API routes (NextAuth won't work)
- No server-side rendering
- No dynamic routes with server data

**For Full Next.js Support on Firebase**, you need Cloud Functions (see below).

### Step 3: Build and Deploy

```bash
# Build static export
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Step 4: Access Your Site

Your app will be live at: `https://your-project-id.web.app`

---

## 🌐 Option 3: Firebase Hosting + Cloud Functions (Full Next.js)

For full Next.js features on Firebase, use this approach.

### Step 1: Install Dependencies

```bash
npm install firebase-functions firebase-admin next-firebase-hosting
```

### Step 2: Set Up Functions

```bash
# Initialize Cloud Functions
firebase init functions

# Choose:
# - Language: TypeScript
# - ESLint: Yes
# - Install dependencies: Yes
```

### Step 3: Configure Functions

**Create `functions/src/index.ts`:**

```typescript
import * as functions from 'firebase-functions';
import next from 'next';

const isDev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev: isDev, conf: { distDir: '.next' } });
const handle = nextApp.getRequestHandler();

export const nextjsFunc = functions.https.onRequest((req, res) => {
  return nextApp.prepare().then(() => handle(req, res));
});
```

### Step 4: Update `firebase.json`

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "function": "nextjsFunc"
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

### Step 5: Deploy

```bash
# Build Next.js
npm run build

# Deploy everything
firebase deploy
```

**Note**: This approach is complex and may have cold start issues. Vercel is recommended.

---

## 🔐 Production Security Checklist

### Before Going Live

- [ ] **Generate new `NEXTAUTH_SECRET`** for production
  ```bash
  node generate-secret.js
  ```

- [ ] **Use production Firebase project** (not development)

- [ ] **Deploy production Firestore rules**
  ```bash
  firebase deploy --only firestore:rules
  ```

- [ ] **Update Google OAuth redirect URIs** with production URL

- [ ] **Set `isApproved: true`** for authorized users in Firestore

- [ ] **Enable HTTPS only** (Vercel does this automatically)

- [ ] **Set up custom domain** (optional, see below)

### Firestore Production Rules

Ensure `firestore.prod.rules` is deployed:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function authed() {
      return request.auth != null;
    }
    
    function isOwner(ownerId) {
      return authed() && request.auth.token.email == ownerId;
    }

    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if authed();
      allow write: if authed() && request.auth.uid == userId;
    }

    match /boards/{boardId} {
      allow read: if authed() && isOwner(resource.data.ownerId);
      allow create: if authed() && isOwner(request.resource.data.ownerId);
      allow update, delete: if authed() && isOwner(resource.data.ownerId);
    }

    match /okrs/{okrId} {
      allow read: if authed() && isOwner(resource.data.ownerId);
      allow create: if authed() && isOwner(request.resource.data.ownerId);
      allow update, delete: if authed() && isOwner(resource.data.ownerId);
    }

    match /tags/{tagId} {
      allow read: if authed();
      allow write: if authed();
    }

    match /categories/{categoryId} {
      allow read: if authed();
      allow write: if authed();
    }
  }
}
```

---

## 🌐 Custom Domain Setup

### For Vercel

1. Go to Vercel dashboard → Your project → "Settings" → "Domains"
2. Add your custom domain (e.g., `mykanban.com`)
3. Follow DNS instructions
4. Vercel automatically provisions SSL certificate
5. Update Google OAuth redirect URIs
6. Update `NEXTAUTH_URL` environment variable

### For Firebase Hosting

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS verification steps
4. Firebase provisions SSL automatically
5. Update OAuth and environment variables

---

## 📊 Monitoring Your Deployment

### Vercel Analytics

Enable in Vercel dashboard:
- Real-time visitor analytics
- Performance monitoring
- Error tracking

### Firebase Performance Monitoring

```bash
# Install
npm install firebase

# Add to your app
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

---

## 🔄 Continuous Deployment

### Automatic Deployment with Vercel

**Already set up!** Every push to `main` branch auto-deploys.

**Preview Deployments**: Every PR gets a preview URL.

### GitHub Actions for Firebase

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # Add all other env vars
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## 🆘 Troubleshooting Deployment

### Issue: OAuth Callback Error

**Cause**: Redirect URI not configured

**Fix**:
1. Check Google Cloud Console → OAuth Client → Redirect URIs
2. Ensure production URL is added
3. Match exactly (including https://)

### Issue: Environment Variables Not Working

**Cause**: Variables not set in hosting platform

**Fix**:
- Vercel: Settings → Environment Variables
- Firebase: `firebase functions:config:set`

### Issue: Firebase Permission Denied

**Cause**: Production security rules too strict

**Fix**:
1. Check `firestore.prod.rules`
2. Verify user authentication
3. Check `ownerId` fields match user email

### Issue: Slow Cold Starts (Firebase Functions)

**Cause**: Cloud Functions go to sleep

**Fix**:
- Upgrade to paid plan (min instances)
- Or use Vercel (no cold starts)

### Issue: Build Fails

**Cause**: Missing dependencies or configuration

**Fix**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build
```

---

## 💰 Cost Considerations

### Vercel Free Tier

**Includes**:
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Perfect for small to medium apps

**Upgrade when**:
- Need more bandwidth
- Want team features
- Need advanced analytics

### Firebase Free Tier (Spark Plan)

**Includes**:
- 10 GB storage
- 360 MB/day database transfer
- 125K function invocations/month

**Upgrade to Blaze** (pay-as-you-go) when:
- Need Cloud Functions
- Exceed free tier limits
- Want production features

---

## ✅ Post-Deployment Checklist

- [ ] App is accessible at public URL
- [ ] Google sign-in works
- [ ] Can create boards and tasks
- [ ] Can create and manage OKRs
- [ ] Drag and drop works
- [ ] All features functional
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Security rules deployed
- [ ] Environment variables set
- [ ] OAuth configured correctly
- [ ] Error monitoring active

---

## 🎉 Deployment Complete!

Your MyKanban app is now live and accessible to the world!

### Share Your App

- **Public URL**: Share your Vercel or Firebase URL
- **Custom Domain**: Set up for professional look
- **Social Media**: Share your achievement!

### Next Steps

1. **Monitor Usage**: Check analytics regularly
2. **User Feedback**: Gather and implement
3. **Performance**: Monitor and optimize
4. **Features**: Continue adding value
5. **Security**: Regular audits and updates

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Cloud Functions](https://firebase.google.com/docs/functions)

---

**Congratulations on deploying your app! 🚀**

