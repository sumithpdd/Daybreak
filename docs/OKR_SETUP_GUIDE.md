# OKR Setup Guide

Complete guide to set up OKRs (Objectives and Key Results) in your Kanban app.

## 📋 Prerequisites

- ✅ Firebase project configured
- ✅ User account created and approved (`isApproved: true` in Firestore users collection)
- ✅ App running locally or deployed

## 🚀 Setup Steps

### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### Step 2: Get Service Account Key

1. Go to **Firebase Console** → Your Project → **Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Save the JSON file as `serviceAccountKey.json` in your project root
4. **Important**: Add to `.gitignore` (already included)

### Step 3: Set Environment Variable

#### Windows PowerShell:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\serviceAccountKey.json"
```

#### Windows CMD:
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your\serviceAccountKey.json
```

#### macOS/Linux:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"
```

### Step 4: Seed Categories

Categories are required for creating OKRs. Run this once:

```bash
node data-migration/seed-categories.js
```

**What gets created:**
- 7 default categories (Professional Development, Customer Success, Product Development, etc.)
- 4 quarterly categories (Q1-Q4 2024)

### Step 5: Seed OKRs and Tasks (Optional)

Populate your app with sample data:

```bash
node data-migration/seed-okrs-with-tasks.js your-email@example.com
```

**What gets created:**
- 4 sample OKRs with different statuses and progress levels
- 12 tasks linked to OKRs and distributed across columns
- 1 board named "My OKR Tasks"

## ✅ Verification

### In Firebase Console

1. Go to **Firebase Console** → **Firestore Database**
2. You should see these collections:
   - `categories` (11 documents)
   - `okrs` (4 documents if you ran the seed script)
   - `boards`, `users`, `tags`

### In Your App

1. **View Categories**: 
   - Navigate to `/okrs`
   - Click "+ Add Objective"
   - Categories dropdown should show 11 options

2. **View OKRs** (if seeded):
   - Go to `/okrs`
   - See 4 OKRs with progress bars
   - Try switching between Individual, Archived, and Organizational tabs

3. **View Tasks** (if seeded):
   - Go to home page
   - Select "My OKR Tasks" from sidebar
   - See 12 tasks across To Do and In Progress columns

## 📊 Using OKRs

### Creating an OKR

1. Click "🎯 OKRs" in navigation
2. Click "+ Add Objective"
3. Fill in:
   - **Objective**: Clear, action-oriented goal
   - **Key Results**: 2-4 measurable outcomes with target/current values
   - **Category**: Select relevant categories
   - **Status**: Not Started, In Progress, Completed, or Needs Revision
   - **Dates**: Optional start and end dates
   - **Progress**: 0-100% completion
4. Click "Create"

### Editing an OKR

1. Click on any OKR card or "Edit" button
2. Use the three tabs:
   - **Objective Details**: Main info and key results
   - **Additional Details**: Progress, dates, notes, flags
   - **History**: Creation and update timestamps
3. Click "Update" to save

### Linking Tasks to OKRs

Tasks can be linked to OKRs and specific key results:

1. Edit a task
2. Use `okrId` and `keyResultId` fields (UI integration)
3. Tasks contribute to OKR progress tracking

### OKR Views

**Grid View** (default): Cards with full details
**List View**: Compact table format
**Kanban View**: Drag-and-drop by status

**Filters:**
- Individual: Personal objectives
- Archived: Completed/inactive OKRs
- Organizational: Company-wide objectives

## 🔄 Managing Categories

### View Categories

Categories are fetched from Firestore dynamically. The modal shows all available categories sorted by default status.

### Add Custom Categories

You can add custom categories programmatically or through Firestore console:

```javascript
{
  id: "custom-category-id",
  name: "Custom Category Name",
  description: "Category description",
  color: "#FF5733", // Hex color code
  isDefault: false,
  createdAt: "2024-11-03T00:00:00Z",
  updatedAt: "2024-11-03T00:00:00Z"
}
```

**Future Enhancement**: Admin UI for category management

## 🆘 Troubleshooting

### "No categories available" Error

**Solution**: Run the categories seed script
```bash
$env:GOOGLE_APPLICATION_CREDENTIALS="path\to\serviceAccountKey.json"
node data-migration/seed-categories.js
```

### "Cannot find module 'firebase-admin'"

**Solution**: Install the package
```bash
npm install firebase-admin
```

### "GOOGLE_APPLICATION_CREDENTIALS not set"

**Solution**: Set the environment variable (use `$env:` syntax in PowerShell)
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\full\path\to\serviceAccountKey.json"
```

### OKRs Not Showing in App

**Check:**
1. You're signed in with the correct email
2. User has `isApproved: true` in Firestore users collection
3. OKRs exist with matching `ownerId` (your email)
4. Try hard refresh (Ctrl+Shift+R)

### Permission Denied Errors

**Solution**: 
- Deploy updated Firestore rules: `firebase deploy --only firestore:rules`
- Verify user is authenticated
- Check browser console for specific errors

## 📁 Files Reference

### Seed Scripts
- `data-migration/seed-categories.js` - Seed OKR categories
- `data-migration/seed-okrs.js` - Seed OKRs only
- `data-migration/seed-okrs-with-tasks.js` - Seed OKRs with linked tasks

### Components
- `src/app/components/OKRBoard.tsx` - Main OKR interface
- `src/app/components/AddAndEditOKRModal.tsx` - Create/edit modal
- `src/app/components/DeleteOKRModal.tsx` - Delete confirmation
- `src/app/components/CreateTaskFromOKRModal.tsx` - Task creation from OKR
- `src/app/components/common/OKRCard.tsx` - Reusable OKR card
- `src/app/components/common/FilterBar.tsx` - Search and filter UI
- `src/app/components/common/StatusBadge.tsx` - Status indicator
- `src/app/components/common/ProgressBar.tsx` - Progress visualization

### API & State
- `src/redux/services/apiSlice.ts` - OKR and Category endpoints
- `src/redux/features/appSlice.ts` - OKR modal state

### Security
- `firestore.prod.rules` - Production security rules
- `firestore.dev.rules` - Development security rules

## 🎯 Sample Data Details

The seed script creates these OKRs:

1. **Improve Technical Skills** (60% progress, In Progress)
   - 4 key results focused on learning and certification

2. **Increase Customer Satisfaction** (62% progress, In Progress)
   - 4 key results tracking retention and feedback

3. **Launch New Product Feature** (65% progress, In Progress)
   - 5 key results for feature development and rollout

4. **Improve Team Collaboration** (45% progress, In Progress)
   - 3 key results on communication and processes

## 🎉 Next Steps

After setup:

1. **Customize OKRs**: Edit sample data or create your own
2. **Link Tasks**: Connect tasks to OKRs for progress tracking
3. **Track Progress**: Update progress % and mark key results complete
4. **Add Categories**: Create custom categories for your needs
5. **Archive Completed**: Move finished OKRs to archived tab

## 📚 Additional Resources

- [OKR Feature Documentation](OKR_FEATURE.md) - Complete feature guide
- [OKR Enhancements](OKR_ENHANCEMENTS.md) - Latest improvements
- [OKR UI Improvements](OKR_UI_IMPROVEMENTS.md) - Design system
- [Data Model](DATA_MODEL.md) - Complete Firestore schema
- [Developer Guide](DEV_GUIDE.md) - Development workflow

---

**Your OKR system is ready!** 🚀
