# OKR Seeding Script

This script seeds sample OKR (Objectives and Key Results) data into your Firestore database based on the provided screenshots.

## Prerequisites

1. Firebase Admin SDK service account key file
2. Node.js installed
3. Environment variable `GOOGLE_APPLICATION_CREDENTIALS` set to the path of your service account key

## Usage

```powershell
# Windows PowerShell - Set the service account credentials (if not already set)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\serviceAccountKey.json"

# Run the seed script with your user email
node data-migration/seed-okrs.js your-email@example.com
```

## What Gets Seeded

The script will create 5 sample OKRs:

1. **AI Fluency OKR** - Strengthen AI skills and experience (In Progress, 60%)
   - 4 key results related to AI skill development, certifications, and tool adoption
   - Category: Required AI OKR FY26

2. **Install Base Adoption OKR** - Drive adoption and renewal success (In Progress, 60%)
   - 4 key results related to win rates, migrations, workshops, and business cases
   - Category: General Business OKR FY26

3. **Product Storytelling OKR** - Personal skills development (In Progress, 65%)
   - 3 key results related to certification, demos, and presentations
   - Categories: General Business OKR FY26, Required Sales OKR FY26

4. **Pending Approval OKR** - Placeholder objective (Needs Revision, 20%)
   - 2 placeholder key results
   - Category: General Business OKR FY26

5. **ProductLead Certification** - Completed personal goal (Completed, 100%, Archived)
   - 2 completed key results
   - Category: Q1 FY23
   - Status: Archived

## Features

- **Automatic cleanup**: Deletes existing OKRs for the user before seeding
- **Progress tracking**: Shows detailed progress during seeding
- **Summary report**: Displays statistics after completion

## Categories Available

- General Business OKR FY26
- Required AI OKR FY26
- Required Sales OKR FY26
- Required People Manager OKR FY26
- Q1 FY23

## Status Values

- Not Started
- In Progress
- Completed
- Needs Revision

## Notes

- Each OKR includes start and end dates
- Progress is tracked as a percentage (0-100)
- Key results can have target values and current values
- OKRs can be marked as archived or organizational

