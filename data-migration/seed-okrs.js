/**
 * Seed script for OKRs (Objectives and Key Results)
 * This script populates the Firestore database with sample OKR data based on the screenshots
 * 
 * Usage: node data-migration/seed-okrs.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  console.error('❌ Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(path.resolve(serviceAccountPath)))
});

const db = admin.firestore();

// Sample OKR data - Generic examples for demonstration
const okrs = [
  {
    ownerId: "user@example.com", // Replace with actual user email
    objective: "Improve Technical Skills and Professional Development",
    keyResults: [
      {
        id: `kr-${Date.now()}-1`,
        text: "Complete 3 technical certifications relevant to current role",
        completed: false,
        targetValue: "3 certifications",
        currentValue: "1 certification",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `kr-${Date.now()}-2`,
        text: "Attend 5 industry conferences or webinars",
        completed: false,
        targetValue: "5 events",
        currentValue: "2 events",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `kr-${Date.now()}-3`,
        text: "Contribute to 2 open source projects",
        completed: false,
        targetValue: "2 projects",
        currentValue: "0 projects",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    status: "In Progress",
    category: ["Professional Development", "Q1 2024"],
    progress: 35,
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    notes: "Focus on expanding technical expertise and industry knowledge",
    archived: false,
    isOrganizational: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    ownerId: "user@example.com",
    objective: "Increase Customer Satisfaction and Retention",
    keyResults: [
      {
        id: `kr-${Date.now()}-4`,
        text: "Achieve customer satisfaction score of 4.5/5 or higher",
        completed: false,
        targetValue: "4.5/5",
        currentValue: "4.2/5",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `kr-${Date.now()}-5`,
        text: "Reduce customer churn rate by 15%",
        completed: false,
        targetValue: "15% reduction",
        currentValue: "8% reduction",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `kr-${Date.now()}-6`,
        text: "Conduct quarterly business reviews with top 20 clients",
        completed: false,
        targetValue: "20 reviews",
        currentValue: "12 reviews",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    status: "In Progress",
    category: ["Customer Success", "Q1 2024"],
    progress: 60,
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    notes: "Prioritize customer engagement and long-term relationships",
    archived: false,
    isOrganizational: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    ownerId: "user@example.com",
    objective: "Launch New Product Feature Successfully",
    keyResults: [
      {
        id: `kr-${Date.now()}-7`,
        text: "Complete product development and testing by target date",
        completed: true,
        targetValue: "100% complete",
        currentValue: "100% complete",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `kr-${Date.now()}-8`,
        text: "Achieve 1000 active users within first month of launch",
        completed: false,
        targetValue: "1000 users",
        currentValue: "750 users",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `kr-${Date.now()}-9`,
        text: "Gather feedback from 100 early adopters",
        completed: true,
        targetValue: "100 responses",
        currentValue: "120 responses",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    status: "In Progress",
    category: ["Product Development", "Q1 2024"],
    progress: 75,
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    notes: "Product launched successfully, monitoring adoption metrics",
    archived: false,
    isOrganizational: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    ownerId: "user@example.com",
    objective: "Improve Team Collaboration and Communication",
    keyResults: [
      {
        id: `kr-${Date.now()}-10`,
        text: "Implement weekly team sync meetings with 90% attendance",
        completed: false,
        targetValue: "90% attendance",
        currentValue: "75% attendance",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `kr-${Date.now()}-11`,
        text: "Deploy collaboration tools and achieve 80% adoption rate",
        completed: false,
        targetValue: "80% adoption",
        currentValue: "50% adoption",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    status: "Needs Revision",
    category: ["Team Management", "Q1 2024"],
    progress: 25,
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    notes: "Need to revise approach to increase tool adoption",
    archived: false,
    isOrganizational: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function seedOKRs() {
  try {
    console.log('🚀 Starting OKR seeding process...');
    
    // Prompt for user email
    const userEmail = process.argv[2];
    if (!userEmail) {
      console.error('❌ Error: Please provide a user email as argument');
      console.log('Usage: node data-migration/seed-okrs.js user@example.com');
      process.exit(1);
    }

    console.log(`📧 Using user email: ${userEmail}`);

    // Update all OKRs with the provided user email
    const updatedOKRs = okrs.map(okr => ({
      ...okr,
      ownerId: userEmail
    }));

    // Get reference to okrs collection
    const okrsCollection = db.collection('okrs');

    // Delete existing OKRs for this user
    console.log('🗑️  Deleting existing OKRs for this user...');
    const existingOKRs = await okrsCollection.where('ownerId', '==', userEmail).get();
    const deleteBatch = db.batch();
    existingOKRs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log(`✅ Deleted ${existingOKRs.size} existing OKR(s)`);

    // Add new OKRs
    console.log('📝 Adding new OKRs...');
    let count = 0;
    for (const okr of updatedOKRs) {
      await okrsCollection.add(okr);
      count++;
      console.log(`  ✅ Added OKR ${count}/${updatedOKRs.length}: ${okr.objective.substring(0, 50)}...`);
    }

    console.log(`\n✨ Successfully seeded ${count} OKRs for ${userEmail}!`);
    console.log('\n📊 Summary:');
    console.log(`  - Total OKRs: ${count}`);
    console.log(`  - In Progress: ${updatedOKRs.filter(o => o.status === 'In Progress').length}`);
    console.log(`  - Completed: ${updatedOKRs.filter(o => o.status === 'Completed').length}`);
    console.log(`  - Needs Revision: ${updatedOKRs.filter(o => o.status === 'Needs Revision').length}`);
    console.log(`  - Archived: ${updatedOKRs.filter(o => o.archived).length}`);

  } catch (error) {
    console.error('❌ Error seeding OKRs:', error);
    process.exit(1);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

// Run the seeding function
seedOKRs();

