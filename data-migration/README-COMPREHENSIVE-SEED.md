# Comprehensive OKR and Task Seeding

This script creates a complete working environment with OKRs and tasks linked together, matching the screenshots exactly.

## What Gets Created

### 4 OKRs with Real Data from Screenshots

1. **AI Fluency OKR** (In Progress, 60%)
   - 4 key results about AI skill development
   - Category: Required AI OKR FY26
   - Includes detailed progress tracking

2. **Install Base Adoption** (In Progress, 62%)
   - 4 key results about renewals and migrations
   - Category: General Business OKR FY26
   - Focus on customer success

3. **Product Storytelling** (In Progress, 65%)
   - 5 key results about certification and demos
   - Categories: General Business + Required Sales OKR FY26
   - Personal development focus

4. **"dsd"** (Needs Revision, 5%)
   - 2 placeholder key results
   - Category: General Business OKR FY26
   - Needs to be properly defined

### 12 Tasks Linked to OKRs

Tasks are distributed across "To Do" and "In Progress" columns, with each task linked to:
- A specific OKR (`okrId`)
- A specific key result (`keyResultId`)

Examples:
- "Complete AI Advantage self-assessment" → AI Fluency OKR
- "Conduct migration assessment for Beta Industries" → Install Base OKR
- "Complete Product certification module 4" → Product OKR

## Usage

```powershell
# Windows PowerShell - Set Firebase credentials
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\serviceAccountKey.json"

# Run with your email (board will be created automatically)
node data-migration/seed-okrs-with-tasks.js your-email@example.com

# Or specify a custom board name
node data-migration/seed-okrs-with-tasks.js your-email@example.com "Q1 2026 Goals"
```

## What Happens

1. **Board Setup**
   - Creates or finds board named "My OKR Tasks" (or your custom name)
   - Sets up 3 columns: To Do, In Progress, Done

2. **OKR Creation**
   - Deletes any existing OKRs for your user
   - Creates 4 new OKRs with exact data from screenshots
   - Each OKR has 2-5 key results with progress tracking

3. **Task Creation**
   - Creates 12 tasks linked to the OKRs
   - Distributes tasks across To Do and In Progress columns
   - Each task includes time tracking and OKR linkage

4. **Summary Report**
   - Shows what was created
   - Lists all OKRs with their status and progress
   - Provides next steps

## Output Example

```
🚀 Starting comprehensive OKR and Task seeding...

📧 User email: john@example.com
📋 Board name: My OKR Tasks

📋 Step 1: Setting up board...
  ✅ Created board: abc123

🎯 Step 2: Creating OKRs...
  ✅ Created: "Strengthen my AI fluency..." (In Progress, 60%)
  ✅ Created: "Drive Adoption and Renewal Success..." (In Progress, 62%)
  ✅ Created: "Personal - Strengthen Skills..." (In Progress, 65%)
  ✅ Created: "dsd" (Needs Revision, 5%)

📝 Step 3: Creating tasks linked to OKRs...
  ✅ Created: "Complete AI Advantage self-assessment" → To Do
  ✅ Created: "Study for Gradial AI certification..." → In Progress
  ✅ Created: "Implement AI tool..." → To Do
  ...

✨ Seeding completed successfully!

📊 Summary:
  ✅ Board: My OKR Tasks (abc123)
  ✅ OKRs created: 4
     - In Progress: 3
     - Needs Revision: 1
  ✅ Tasks created: 12
     - To Do: 6
     - In Progress: 6
     - Done: 0

🎯 OKR Details:
  1. Strengthen my AI fluency and applied experience...
     Status: In Progress | Progress: 60% | Category: Required AI OKR FY26
     Key Results: 4
  2. Drive Adoption and Renewal Success in the Install Base
     Status: In Progress | Progress: 62% | Category: General Business OKR FY26
     Key Results: 4
  3. Personal - Strengthen Skills and Influence in Product...
     Status: In Progress | Progress: 65% | Category: General Business OKR FY26, Required Sales OKR FY26
     Key Results: 5
  4. dsd
     Status: Needs Revision | Progress: 5% | Category: General Business OKR FY26
     Key Results: 2

🚀 Next steps:
  1. Navigate to http://localhost:3000/okrs to view OKRs
  2. Navigate to http://localhost:3000 and select "My OKR Tasks" board
  3. Edit tasks to see their OKR linkage
  4. Track progress on both OKRs and related tasks
```

## Task-OKR Linkage

Each task created has:
- `okrId`: Links to the parent OKR
- `keyResultId`: Links to a specific key result
- Proper time tracking (`timeSpent`, `timeEstimate`)
- Rich HTML description
- Ready for tagging and assignment

## Next Steps After Seeding

1. **View OKRs**
   - Go to `/okrs` page
   - See all 4 OKRs with progress bars
   - Switch between tabs (Individual, Archived, Organizational)
   - Click any OKR to edit

2. **View Tasks**
   - Go to home page
   - Select "My OKR Tasks" board from sidebar
   - See tasks distributed across columns
   - Each task is linked to an OKR

3. **Edit and Track**
   - Edit OKRs to update progress
   - Move tasks through columns
   - Mark key results as complete
   - Add more tasks linked to OKRs

## Benefits of This Comprehensive Seed

✅ **Complete Working Environment**: Everything is set up and connected  
✅ **Realistic Data**: Based on actual screenshots and use cases  
✅ **Task-OKR Integration**: See how tasks relate to objectives  
✅ **Progress Tracking**: All progress values are realistic  
✅ **Ready for Demo**: Perfect for showcasing the full system  

## Customization

You can modify `seed-okrs-with-tasks.js` to:
- Change OKR objectives and key results
- Add more tasks
- Adjust progress percentages
- Change status distributions
- Modify categories
- Add different time estimates

## Troubleshooting

**Board not showing up?**
- Check user email is correct
- Verify Firebase credentials
- Look in console for board ID

**Tasks not linked to OKRs?**
- Tasks store `okrId` and `keyResultId` fields
- Currently displayed in task details (future: show in UI)

**Want to re-seed?**
- Script automatically deletes existing OKRs before creating new ones
- Board and tasks are preserved (edit board manually if needed)

