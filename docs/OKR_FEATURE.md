# OKR Feature Documentation

## Overview

The OKR (Objectives and Key Results) feature allows users to track and manage their professional objectives with measurable key results. This feature is fully integrated with the kanban task management system.

## Features

### Objective Management
- Create, edit, and delete objectives
- Set objective status (Not Started, In Progress, Completed, Needs Revision)
- Track progress percentage (0-100%)
- Add start and end dates
- Categorize objectives (General Business, Required AI, Required Sales, etc.)
- Archive completed objectives
- Mark objectives as organizational

### Key Results
- Add 2-4 key results per objective
- Track completion status
- Set target and current values
- Mark individual key results as completed

### Views
1. **Progress View**: Visual progress bars showing objective advancement across three stages
2. **Card View**: Detailed cards showing objective information, categories, and status
3. **Tabs**: Filter by Individual, Archived, or Organizational objectives

## User Interface

### Navigation
- Access OKRs via the "🎯 OKRs" button in the navbar
- Toggle between Boards and OKRs views

### OKR Board
The main OKR board displays:
- Progress bars for each objective
- Status indicators
- Quick edit access
- Filterable tabs

### OKR Modal
The edit modal includes three tabs:
1. **Objective Details**: Core information and key results
2. **Additional Details**: Progress, dates, notes, flags
3. **History**: Creation and update timestamps

## Data Model

### OKR Object
```typescript
{
  id: string;
  ownerId: string; // user email
  objective: string;
  keyResults: KeyResult[];
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Needs Revision';
  category: string[];
  progress: number; // 0-100
  startDate?: string;
  endDate?: string;
  notes?: string;
  archived: boolean;
  isOrganizational: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Key Result Object
```typescript
{
  id: string;
  text: string;
  completed: boolean;
  targetValue?: string;
  currentValue?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Task Integration

Tasks can be linked to OKRs and specific key results:
- `okrId`: Links a task to an objective
- `keyResultId`: Links a task to a specific key result

This allows users to track which tasks contribute to their objectives.

## Categories

Categories are stored in Firestore and fetched dynamically from the `categories` collection. Default categories include:
- Professional Development
- Customer Success
- Product Development
- Team Management
- Sales & Revenue
- Marketing
- Operations
- Quarterly categories (Q1-Q4)

To add more categories, use the categories API endpoints or add them directly in Firestore. See [OKR Setup Guide](OKR_SETUP_GUIDE.md) for details.

## Security Rules

OKRs are user-specific:
- Users can only read their own OKRs
- Users can only create, update, and delete their own OKRs
- OKRs are filtered by `ownerId` (user email)

## API Endpoints

### Queries
- `useFetchOKRsQuery()`: Fetch all OKRs for current user

### Mutations
- `useCreateOKRMutation()`: Create a new OKR
- `useUpdateOKRMutation()`: Update an existing OKR
- `useDeleteOKRMutation()`: Delete an OKR

## Seeding Sample Data

To populate your database with sample OKRs and tasks:

```bash
# Windows PowerShell - Set Firebase credentials
$env:GOOGLE_APPLICATION_CREDENTIALS="path\to\serviceAccountKey.json"

# Seed categories (required, run once)
node data-migration/seed-categories.js

# Seed OKRs with tasks (optional)
node data-migration/seed-okrs-with-tasks.js your-email@example.com
```

See [OKR Setup Guide](OKR_SETUP_GUIDE.md) for complete setup instructions.

## Component Structure

### Main Components
- `OKRBoard.tsx`: Main board view with tabs and cards
- `AddAndEditOKRModal.tsx`: Modal for creating/editing OKRs

### Redux Integration
- State management in `appSlice.ts`
- API slice integration in `apiSlice.ts`

### Routes
- `/okrs`: OKR board page
- `/`: Kanban boards page (home)

## Best Practices

### Writing Good Objectives
- Use action-oriented language
- Focus on outcomes, not tasks
- Make them aspirational but achievable
- Align with team/company goals

### Writing Good Key Results
- Make them measurable and specific
- Include quantifiable targets
- Use SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
- Limit to 2-4 per objective

### Progress Tracking
- Update progress regularly (weekly/bi-weekly)
- Link tasks to key results
- Archive completed objectives
- Review status quarterly

## Future Enhancements

Potential improvements:
- Team OKRs with shared ownership
- OKR templates
- Progress history tracking
- Reporting and analytics
- Export to PDF/Excel
- Integration with calendar
- Notifications for due dates
- Comments and collaboration
- OKR alignment visualization

## Troubleshooting

### OKRs not showing
- Check authentication status
- Verify ownerId matches logged-in user email
- Check Firestore security rules
- Verify Firebase configuration

### Can't create OKRs
- Ensure at least 2 key results
- Verify all required fields are filled
- Check category selection
- Review browser console for errors

### Seed script errors
- Verify GOOGLE_APPLICATION_CREDENTIALS is set
- Check service account has Firestore permissions
- Ensure user email is valid
- Verify Firebase project is accessible

