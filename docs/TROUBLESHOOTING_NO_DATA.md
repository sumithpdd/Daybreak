# Troubleshooting: Cannot See OKRs and Tasks

## Quick Diagnostic Steps

### ✅ Step 1: Verify Email Match

**This is the #1 cause of "no data" issues!**

1. **Check your logged-in email** (top-right corner of navbar)
2. **Must exactly match** the email you used in the seed script

```bash
# Example - both must be identical:
Logged in as: john.doe@company.com
Seed command: node data-migration/seed-okrs-with-tasks.js john.doe@company.com
                                                            ^^^^^^^^^^^^^^^^^^^
                                                            Must match exactly!
```

**Fix:** Re-run seed script with the correct email:
```powershell
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
node data-migration/seed-okrs-with-tasks.js your-actual-login-email@example.com
```

---

### ✅ Step 2: Check Firebase Console

Verify data was actually created:

1. Go to https://console.firebase.google.com
2. Select your project
3. Go to **Firestore Database**
4. Look for these collections:
   - `okrs` - should have 4 documents
   - `boards` - should have a board named "My OKR Tasks"

**If collections are empty:**
- The seed script didn't run successfully
- Check error messages when running the script

**If collections have data:**
- Data exists but user can't see it
- This is an email mismatch or permissions issue

---

### ✅ Step 3: Check Console Logs

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when loading the page

**Common errors and fixes:**

**Error:** "No session"
- **Fix:** You're not signed in. Click "Sign In" in navbar.

**Error:** "Permission denied"
- **Fix:** Firestore rules issue. Check firestore.rules file.

**Error:** "User not approved"
- **Fix:** Check your user document in Firestore, set `isApproved: true`

---

### ✅ Step 4: Manual User Approval Check

Some users need to be approved to see boards:

1. Go to Firebase Console → Firestore
2. Open `users` collection
3. Find your user document (by email)
4. Check if `isApproved: true`

**If isApproved is false or missing:**
```javascript
// Update in Firebase Console:
{
  email: "your-email@example.com",
  name: "Your Name",
  isApproved: true,  // ← Make sure this is true
  createdAt: "...",
  updatedAt: "..."
}
```

---

## 🔧 Complete Diagnostic Script

Run this in Windows PowerShell:

```powershell
# 1. Verify Firebase credentials
$env:GOOGLE_APPLICATION_CREDENTIALS

# 2. Check if file exists
Test-Path $env:GOOGLE_APPLICATION_CREDENTIALS

# 3. Set credentials (if not set)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\code\react\mykanban-app\serviceAccountKey.json"

# 4. Run seed script with verbose output
node data-migration/seed-okrs-with-tasks.js your-email@example.com
```

**Look for these in the output:**

✅ **Success indicators:**
```
✅ Created board: [some-id]
✅ Created: "Strengthen my AI fluency..." (In Progress, 60%)
✅ Created: "Drive Adoption..." (In Progress, 62%)
✅ Created: "Personal - Strengthen..." (In Progress, 65%)
✅ Created: "dsd" (Needs Revision, 5%)
✨ Seeding completed successfully!
```

❌ **Failure indicators:**
```
❌ Error: GOOGLE_APPLICATION_CREDENTIALS not set
❌ Error seeding OKRs: [error message]
❌ Permission denied
```

---

## 🔍 Step-by-Step Verification

### 1. Check OKRs Page

```bash
# After seed script completes:
npm run dev

# Navigate to: http://localhost:3000/okrs
```

**What you should see:**
- Header: "Track My Objectives"
- Tabs: Individual, Archived, Organizational
- 4 OKRs with progress bars
- Each showing status and progress %

**If page is empty:**
- Check browser console for errors (F12)
- Verify you're signed in (check top-right)
- Verify email matches seed script email

### 2. Check Boards Page

```bash
# Navigate to: http://localhost:3000
```

**What you should see:**
- Sidebar on left with boards list
- "My OKR Tasks" in the list
- Click it to see tasks

**If sidebar is empty:**
- User not approved (see Step 4 above)
- Email mismatch
- No boards created

### 3. Check Board Tasks

Click "My OKR Tasks" in sidebar.

**What you should see:**
- 3 columns: To Do, In Progress, Done
- 6 tasks in "To Do"
- 6 tasks in "In Progress"

**If board is empty:**
- Board exists but tasks weren't created
- Re-run seed script

---

## 🛠️ Common Fixes

### Fix 1: Email Mismatch
```powershell
# Get your actual email from the navbar
# Then re-run with correct email:
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
node data-migration/seed-okrs-with-tasks.js correct-email@example.com
```

### Fix 2: User Not Approved

**Option A: Via Firebase Console**
1. Go to Firestore Database
2. Open `users` collection
3. Find your user
4. Edit document
5. Set `isApproved: true`
6. Save

**Option B: Disable approval check**

Edit `src/redux/services/apiSlice.ts`:

Find this section (around line 280-287):
```typescript
// Approval gate
const usersRef = collection(db, 'users');
const uq = query(usersRef, where('email', '==', userEmail));
const uSnap = await getDocs(uq);
const userDoc = uSnap.docs[0]?.data() as IUser | undefined;
if (!userDoc?.isApproved) {
  if (process.env.NODE_ENV !== 'production') console.log('⛔ Not approved; hiding boards');
  return { data: [] };
}
```

**Comment it out temporarily:**
```typescript
// Approval gate - TEMPORARILY DISABLED FOR TESTING
// const usersRef = collection(db, 'users');
// const uq = query(usersRef, where('email', '==', userEmail));
// const uSnap = await getDocs(uq);
// const userDoc = uSnap.docs[0]?.data() as IUser | undefined;
// if (!userDoc?.isApproved) {
//   if (process.env.NODE_ENV !== 'production') console.log('⛔ Not approved; hiding boards');
//   return { data: [] };
// }
```

Then refresh your browser.

### Fix 3: Firebase Rules Issue

Check `firestore.dev.rules` - should allow all operations for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Development: Allow all reads and writes
    match /{document=**} {
      allow read, write: if true;  // ← Should be 'true' for dev
    }
  }
}
```

Deploy the rules if needed:
```bash
firebase deploy --only firestore:rules
```

### Fix 4: Clear and Re-seed

Start fresh:

```powershell
# 1. Check your login email in the navbar
# Let's say it's: john@example.com

# 2. Re-run seed script (Windows PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\code\react\mykanban-app\serviceAccountKey.json"
node data-migration/seed-okrs-with-tasks.js john@example.com

# 3. Wait for success message
# ✨ Seeding completed successfully!

# 4. Refresh browser (Ctrl+F5)

# 5. Check /okrs page
# 6. Check boards page
```

---

## 🎯 Test Each Component

### Test 1: OKRs Only

Check if OKRs were created:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Paste and run:

```javascript
// This checks the Redux state
console.log('Checking OKRs...');
```

4. Navigate to http://localhost:3000/okrs
5. Watch console for fetch errors

### Test 2: Boards Only

1. Navigate to http://localhost:3000
2. Open DevTools Console
3. Look for board fetch logs
4. Should see: "🔍 fetchBoards - [timestamp]"

### Test 3: Check Redux DevTools

If you have Redux DevTools installed:

1. Open Redux DevTools
2. Look for `firestoreApi/queries`
3. Check `fetchOKRs` and `fetchBoards` queries
4. See if they have data or errors

---

## 📝 Verification Checklist

Run through this checklist:

- [ ] Firebase credentials set: `$env:GOOGLE_APPLICATION_CREDENTIALS` (PowerShell)
- [ ] Categories seeded: `node data-migration/seed-categories.js`
- [ ] OKRs seed script ran successfully (saw ✨ success message)
- [ ] Signed in to app (see profile in top-right)
- [ ] Email in navbar matches email in seed command
- [ ] Navigated to `/okrs` page
- [ ] Navigated to `/` and checked sidebar
- [ ] No console errors (checked F12)
- [ ] User has `isApproved: true` in Firestore
- [ ] Development mode (npm run dev)

---

## 🆘 Still Not Working?

### Get Detailed Logs

1. **Check seed script output** - Save it to a file:
```powershell
node data-migration/seed-okrs-with-tasks.js your-email@example.com 2>&1 | Tee-Object seed-output.txt
```

2. **Check browser console** - Look for specific errors

3. **Check Firebase Console** - Verify data in Firestore:
   - Collections: `okrs`, `boards`, `users`
   - Documents: Should see your data

### Share These Details

If you need help, provide:

1. **Seed script output** (copy/paste the terminal output)
2. **Browser console errors** (F12 → Console tab)
3. **Email you're using** (from navbar)
4. **Email in seed command** (what you typed)
5. **Firebase Console screenshot** (showing collections)

---

## 🚀 Quick Reset

If all else fails, complete reset:

```powershell
# 1. Stop the dev server (Ctrl+C)

# 2. Clear browser cache and cookies for localhost:3000

# 3. Delete .next folder
Remove-Item -Recurse -Force .next

# 4. Verify your login email
# Go to http://localhost:3000, sign in, check navbar email

# 5. Re-run seed with EXACT email from step 4
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\code\react\mykanban-app\serviceAccountKey.json"
node data-migration/seed-categories.js  # Run categories first
node data-migration/seed-okrs-with-tasks.js email-from-step-4@example.com

# 6. Start dev server
npm run dev

# 7. Hard refresh browser (Ctrl+Shift+R or Ctrl+F5)

# 8. Check /okrs page
```

---

## 💡 Pro Tips

1. **Always use the same email** for seed script and login
2. **Check Firebase Console** to verify data exists
3. **Look at browser console** for real-time errors
4. **User must be approved** (isApproved: true)
5. **Use development Firebase rules** (allow all for testing)

---

**Most common solution:** Re-run the seed script with the exact email shown in your navbar! 🎯

