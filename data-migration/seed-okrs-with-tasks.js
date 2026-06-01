/**
 * Comprehensive seed script for OKRs and Tasks
 * Creates OKRs and sample tasks linked to them, matching the screenshots
 * 
 * Usage: node data-migration/seed-okrs-with-tasks.js <user-email> <board-name>
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

// Helper to generate unique IDs
const generateId = (prefix = '') => `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

// Sample OKR data - Generic examples for demonstration
const createOKRs = (userEmail) => [
  {
    id: 'okr-1',
    ownerId: userEmail,
    objective: "Improve Technical Skills and Professional Development",
    keyResults: [
      {
        id: generateId('kr-'),
        text: "Complete 3 technical certifications relevant to current role",
        completed: false,
        targetValue: "3 certifications",
        currentValue: "1 certification",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('kr-'),
        text: "Attend 5 industry conferences or webinars",
        completed: false,
        targetValue: "5 events",
        currentValue: "2 events",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('kr-'),
        text: "Contribute to 2 open source projects",
        completed: false,
        targetValue: "2 projects",
        currentValue: "0 projects",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('kr-'),
        text: "Mentor 2 junior team members",
        completed: false,
        targetValue: "2 mentees",
        currentValue: "1 mentee",
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
    id: 'okr-2',
    ownerId: userEmail,
    objective: "Increase Customer Satisfaction and Retention",
    keyResults: [
      {
        id: generateId('kr-'),
        text: "Achieve customer satisfaction score of 4.5/5 or higher",
        completed: false,
        targetValue: "4.5/5",
        currentValue: "4.2/5",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('kr-'),
        text: "Reduce customer churn rate by 15%",
        completed: false,
        targetValue: "15% reduction",
        currentValue: "8% reduction",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('kr-'),
        text: "Conduct quarterly business reviews with top 20 clients",
        completed: false,
        targetValue: "20 reviews",
        currentValue: "12 reviews",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('kr-'),
        text: "Implement 3 customer-requested features",
        completed: false,
        targetValue: "3 features",
        currentValue: "1 feature",
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
    id: 'okr-3',
    ownerId: userEmail,
    objective: "Launch New Product Feature Successfully",
    keyResults: [
      {
        id: generateId('kr-'),
        text: "Complete product development and testing by target date",
        completed: true,
        targetValue: "100% complete",
        currentValue: "100% complete",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('kr-'),
        text: "Achieve 1000 active users within first month of launch",
        completed: false,
        targetValue: "1000 users",
        currentValue: "750 users",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('kr-'),
        text: "Gather feedback from 100 early adopters",
        completed: true,
        targetValue: "100 responses",
        currentValue: "120 responses",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('kr-'),
        text: "Achieve Net Promoter Score of 50+",
        completed: false,
        targetValue: "50+ NPS",
        currentValue: "45 NPS",
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
    id: 'okr-4',
    ownerId: userEmail,
    objective: "Improve Team Collaboration and Communication",
    keyResults: [
      {
        id: generateId('kr-'),
        text: "Implement weekly team sync meetings with 90% attendance",
        completed: false,
        targetValue: "90% attendance",
        currentValue: "75% attendance",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId('kr-'),
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

// Sample tasks linked to OKRs - Generic examples
const createTasks = (okrIds) => [
  // Tasks for Professional Development OKR
  {
    title: "Research and enroll in certification program",
    description: "<p>Research available certifications and enroll in the first one. Plan study schedule.</p>",
    okrId: okrIds[0],
    keyResultId: "kr-1",
    tags: [],
    assignedTo: [],
    timeSpent: 30,
    timeEstimate: 60,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    progress: 50,
  },
  {
    title: "Register for industry conference",
    description: "<p>Find and register for relevant industry conferences and webinars for the quarter.</p>",
    okrId: okrIds[0],
    keyResultId: "kr-2",
    tags: [],
    assignedTo: [],
    timeSpent: 60,
    timeEstimate: 90,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 70,
  },
  {
    title: "Identify open source projects to contribute to",
    description: "<p>Research and identify open source projects that align with skills and interests.</p>",
    okrId: okrIds[0],
    keyResultId: "kr-3",
    tags: [],
    assignedTo: [],
    timeSpent: 45,
    timeEstimate: 120,
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    progress: 25,
  },
  {
    title: "Schedule mentorship kickoff meeting",
    description: "<p>Set up initial meeting with mentee to establish goals and expectations.</p>",
    okrId: okrIds[0],
    keyResultId: "kr-4",
    tags: [],
    assignedTo: [],
    timeSpent: 30,
    timeEstimate: 60,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 80,
  },
  
  // Tasks for Customer Success OKR
  {
    title: "Send customer satisfaction survey",
    description: "<p>Prepare and send out quarterly customer satisfaction survey to all active customers.</p>",
    okrId: okrIds[1],
    keyResultId: "kr-1",
    tags: [],
    assignedTo: [],
    timeSpent: 60,
    timeEstimate: 120,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    progress: 50,
  },
  {
    title: "Analyze churn patterns",
    description: "<p>Review customer data to identify patterns in churn and develop retention strategies.</p>",
    okrId: okrIds[1],
    keyResultId: "kr-2",
    tags: [],
    assignedTo: [],
    timeSpent: 120,
    timeEstimate: 240,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 60,
  },
  {
    title: "Schedule business review meetings",
    description: "<p>Reach out to top clients to schedule quarterly business review meetings.</p>",
    okrId: okrIds[1],
    keyResultId: "kr-3",
    tags: [],
    assignedTo: [],
    timeSpent: 90,
    timeEstimate: 180,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 65,
  },
  {
    title: "Review customer feature requests",
    description: "<p>Compile and prioritize customer-requested features for development roadmap.</p>",
    okrId: okrIds[1],
    keyResultId: "kr-4",
    tags: [],
    assignedTo: [],
    timeSpent: 75,
    timeEstimate: 150,
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 40,
  },
  
  // Tasks for Product Launch OKR
  {
    title: "Conduct final QA testing",
    description: "<p>Perform final round of quality assurance testing before product launch.</p>",
    okrId: okrIds[2],
    keyResultId: "kr-1",
    tags: [],
    assignedTo: [],
    timeSpent: 180,
    timeEstimate: 180,
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 100,
  },
  {
    title: "Launch marketing campaign",
    description: "<p>Execute marketing campaign to drive user acquisition and meet growth targets.</p>",
    okrId: okrIds[2],
    keyResultId: "kr-2",
    tags: [],
    assignedTo: [],
    timeSpent: 120,
    timeEstimate: 240,
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 75,
  },
  {
    title: "Compile early adopter feedback",
    description: "<p>Collect and analyze feedback from early users to inform product improvements.</p>",
    okrId: okrIds[2],
    keyResultId: "kr-3",
    tags: [],
    assignedTo: [],
    timeSpent: 60,
    timeEstimate: 120,
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    progress: 90,
  },
];

async function seedOKRsAndTasks() {
  try {
    console.log('🚀 Starting comprehensive OKR and Task seeding...\n');
    
    // Get arguments
    const userEmail = process.argv[2];
    const boardName = process.argv[3] || "My OKR Tasks";
    
    if (!userEmail) {
      console.error('❌ Error: Please provide a user email as argument');
      console.log('Usage: node data-migration/seed-okrs-with-tasks.js user@example.com [board-name]');
      process.exit(1);
    }

    console.log(`📧 User email: ${userEmail}`);
    console.log(`📋 Board name: ${boardName}\n`);

    // Step 1: Create or find board
    console.log('📋 Step 1: Setting up board...');
    const boardsRef = db.collection('boards');
    const boardQuery = await boardsRef
      .where('ownerId', '==', userEmail)
      .where('name', '==', boardName)
      .get();
    
    let boardId;
    let board;
    
    if (boardQuery.empty) {
      console.log('  Creating new board...');
      const newBoard = {
        name: boardName,
        description: "Tasks linked to my OKRs",
        ownerId: userEmail,
        owners: [userEmail],
        members: [],
        columns: [
          { id: 'col-1', name: 'To Do', tasks: [] },
          { id: 'col-2', name: 'In Progress', tasks: [] },
          { id: 'col-3', name: 'Done', tasks: [] },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const boardRef = await boardsRef.add(newBoard);
      boardId = boardRef.id;
      board = newBoard;
      console.log(`  ✅ Created board: ${boardId}`);
    } else {
      boardId = boardQuery.docs[0].id;
      board = boardQuery.docs[0].data();
      console.log(`  ✅ Found existing board: ${boardId}`);
    }

    // Step 2: Create OKRs
    console.log('\n🎯 Step 2: Creating OKRs...');
    const okrsCollection = db.collection('okrs');
    
    // Delete existing OKRs for this user
    const existingOKRs = await okrsCollection.where('ownerId', '==', userEmail).get();
    if (!existingOKRs.empty) {
      console.log(`  Deleting ${existingOKRs.size} existing OKR(s)...`);
      const deleteBatch = db.batch();
      existingOKRs.forEach(doc => deleteBatch.delete(doc.ref));
      await deleteBatch.commit();
    }
    
    const okrsData = createOKRs(userEmail);
    const okrIds = [];
    
    for (const okr of okrsData) {
      const okrRef = await okrsCollection.add(okr);
      okrIds.push(okrRef.id);
      console.log(`  ✅ Created: "${okr.objective.substring(0, 60)}..." (${okr.status}, ${okr.progress}%)`);
    }

    // Step 3: Create Tasks linked to OKRs
    console.log('\n📝 Step 3: Creating tasks linked to OKRs...');
    const tasksData = createTasks(okrIds);
    
    // Distribute tasks across columns
    const columns = [...board.columns];
    tasksData.forEach((taskData, index) => {
      const columnIndex = index % 2 === 0 ? 0 : 1; // Alternate between To Do and In Progress
      const task = {
        id: generateId('task-'),
        ...taskData,
        status: columns[columnIndex].name,
        order: columns[columnIndex].tasks.length,
        createdAt: new Date().toISOString(),
        createdBy: userEmail,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail,
        checklistItems: [],
        notes: "",
      };
      columns[columnIndex].tasks.push(task);
      console.log(`  ✅ Created: "${task.title}" → ${columns[columnIndex].name}`);
    });
    
    // Update board with tasks
    await boardsRef.doc(boardId).update({
      columns: columns,
      updatedAt: new Date().toISOString(),
    });

    // Summary
    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  ✅ Board: ${boardName} (${boardId})`);
    console.log(`  ✅ OKRs created: ${okrIds.length}`);
    console.log(`     - In Progress: ${okrsData.filter(o => o.status === 'In Progress').length}`);
    console.log(`     - Needs Revision: ${okrsData.filter(o => o.status === 'Needs Revision').length}`);
    console.log(`  ✅ Tasks created: ${tasksData.length}`);
    console.log(`     - To Do: ${columns[0].tasks.length}`);
    console.log(`     - In Progress: ${columns[1].tasks.length}`);
    console.log(`     - Done: ${columns[2].tasks.length}`);
    console.log('\n🎯 OKR Details:');
    okrsData.forEach((okr, i) => {
      console.log(`  ${i + 1}. ${okr.objective.substring(0, 70)}...`);
      console.log(`     Status: ${okr.status} | Progress: ${okr.progress}% | Category: ${okr.category.join(', ')}`);
      console.log(`     Key Results: ${okr.keyResults.length}`);
    });
    
    console.log('\n🚀 Next steps:');
    console.log('  1. Navigate to http://localhost:3000/okrs to view OKRs');
    console.log(`  2. Navigate to http://localhost:3000 and select "${boardName}" board`);
    console.log('  3. Edit tasks to see their OKR linkage');
    console.log('  4. Track progress on both OKRs and related tasks\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

// Run the seeding function
seedOKRsAndTasks();

