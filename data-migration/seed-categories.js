/**
 * Seed script for OKR Categories
 * Creates standard categories in Firestore for use across the organization
 * 
 * Usage: node data-migration/seed-categories.js
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

// Standard categories for OKRs
const categories = [
  {
    name: "Professional Development",
    description: "Personal growth, skills development, and learning objectives",
    color: "#3B82F6", // blue
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Customer Success",
    description: "Customer satisfaction, retention, and support objectives",
    color: "#10B981", // green
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Product Development",
    description: "Product features, releases, and improvements",
    color: "#8B5CF6", // purple
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Team Management",
    description: "Team collaboration, processes, and culture",
    color: "#F59E0B", // amber
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Sales & Revenue",
    description: "Sales targets, revenue growth, and market expansion",
    color: "#EF4444", // red
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Marketing",
    description: "Brand awareness, campaigns, and lead generation",
    color: "#EC4899", // pink
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Operations",
    description: "Process improvements, efficiency, and infrastructure",
    color: "#6366F1", // indigo
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Q1 2024",
    description: "First quarter objectives for 2024",
    color: "#06B6D4", // cyan
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Q2 2024",
    description: "Second quarter objectives for 2024",
    color: "#14B8A6", // teal
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Q3 2024",
    description: "Third quarter objectives for 2024",
    color: "#84CC16", // lime
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Q4 2024",
    description: "Fourth quarter objectives for 2024",
    color: "#F97316", // orange
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function seedCategories() {
  try {
    console.log('🚀 Starting OKR Categories seeding process...\n');

    const categoriesCollection = db.collection('categories');

    // Check if categories already exist
    const existingCategories = await categoriesCollection.get();
    
    if (!existingCategories.empty) {
      console.log(`⚠️  Found ${existingCategories.size} existing categories`);
      console.log('Would you like to:');
      console.log('  1. Keep existing and skip seeding');
      console.log('  2. Add new categories only (no duplicates)');
      console.log('  3. Replace all categories');
      console.log('\nFor now, adding new categories only...\n');
    }

    // Get existing category names
    const existingNames = new Set();
    existingCategories.forEach(doc => {
      existingNames.add(doc.data().name);
    });

    // Add new categories
    console.log('📝 Adding categories...');
    let addedCount = 0;
    let skippedCount = 0;

    for (const category of categories) {
      if (existingNames.has(category.name)) {
        console.log(`  ⏭️  Skipped: "${category.name}" (already exists)`);
        skippedCount++;
      } else {
        await categoriesCollection.add(category);
        console.log(`  ✅ Added: "${category.name}" (${category.color})`);
        addedCount++;
      }
    }

    console.log(`\n✨ Seeding completed!`);
    console.log('\n📊 Summary:');
    console.log(`  - Categories added: ${addedCount}`);
    console.log(`  - Categories skipped: ${skippedCount}`);
    console.log(`  - Total categories: ${existingCategories.size + addedCount}`);
    console.log(`  - Default categories: ${categories.filter(c => c.isDefault).length}`);

    console.log('\n💡 Categories are now available for all users when creating OKRs');

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

// Run the seeding function
seedCategories();

