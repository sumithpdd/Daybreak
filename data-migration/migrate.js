const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, query, where, deleteDoc, addDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility function to generate unique IDs
const generateUniqueId = (prefix = '') => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Migration utilities
class DataMigration {
  static async diagnoseDuplicates() {
    console.log('🔍 DIAGNOSTIC MODE - No changes will be made');
    console.log('📋 Analyzing your existing tasks for duplicates...\n');
    
    const boardsRef = collection(db, 'boards');
    const boardsSnapshot = await getDocs(boardsRef);
    
    console.log(`📊 Found ${boardsSnapshot.docs.length} boards in your database\n`);
    
    let totalTasks = 0;
    let duplicateCount = 0;
    const duplicateDetails = [];
    
    for (const boardDoc of boardsSnapshot.docs) {
      const boardData = boardDoc.data();
      console.log(`🔍 Board: "${boardData.name}" (${boardDoc.id})`);
      
      boardData.columns.forEach(column => {
        if (column.tasks && column.tasks.length > 0) {
          console.log(`  📝 Column "${column.name}": ${column.tasks.length} tasks`);
          
          const taskIds = column.tasks.map(task => task.id);
          const uniqueIds = new Set(taskIds);
          
          if (taskIds.length !== uniqueIds.size) {
            const idCounts = {};
            taskIds.forEach(id => {
              idCounts[id] = (idCounts[id] || 0) + 1;
            });
            
            const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);
            
            console.log(`    ⚠️  DUPLICATES FOUND:`);
            duplicates.forEach(([id, count]) => {
              console.log(`      - Task ID "${id}" appears ${count} times`);
              duplicateCount += count - 1;
              duplicateDetails.push({
                board: boardData.name,
                column: column.name,
                taskId: id,
                count: count
              });
            });
          } else {
            console.log(`    ✅ No duplicates found`);
          }
          
          totalTasks += column.tasks.length;
        }
      });
      console.log('');
    }
    
    console.log('📊 SUMMARY:');
    console.log(`  Total tasks: ${totalTasks}`);
    console.log(`  Duplicate tasks: ${duplicateCount}`);
    console.log(`  Unique tasks: ${totalTasks - duplicateCount}`);
    
    if (duplicateCount > 0) {
      console.log('\n⚠️  RECOMMENDATION:');
      console.log('  You have duplicate tasks that are causing React key warnings.');
      console.log('  Run: node data-migration/migrate.js --fix-duplicates');
    } else {
      console.log('\n✅ No duplicates found! Your data is clean.');
    }
  }

  static async fixDuplicates() {
    console.log('🔧 FIXING DUPLICATE IDs AND ORDER - No tasks will be deleted');
    console.log('📋 Updating duplicate IDs and fixing order fields...\n');
    
    const boardsRef = collection(db, 'boards');
    const boardsSnapshot = await getDocs(boardsRef);
    
    console.log(`📊 Found ${boardsSnapshot.docs.length} boards to process\n`);
    
    for (const boardDoc of boardsSnapshot.docs) {
      const boardData = boardDoc.data();
      console.log(`🔍 Processing board: "${boardData.name}" (${boardDoc.id})`);
      
      let hasChanges = false;
      const updatedColumns = boardData.columns.map(column => {
        if (column.tasks && column.tasks.length > 0) {
          console.log(`  📝 Column "${column.name}": ${column.tasks.length} tasks`);
          
          const taskIds = column.tasks.map(task => task.id);
          const uniqueIds = new Set(taskIds);
          
          if (taskIds.length !== uniqueIds.size) {
            console.log(`    ⚠️  Found duplicate IDs, fixing...`);
            
            const seenIds = new Set();
            const updatedTasks = column.tasks.map((task, index) => {
              let newTask = { ...task };
              
              if (seenIds.has(task.id)) {
                const newId = generateUniqueId('task-');
                console.log(`      🔄 Changing task ID "${task.id}" to "${newId}"`);
                newTask.id = newId;
                hasChanges = true;
              } else {
                seenIds.add(task.id);
              }
              
              if (newTask.order === undefined || newTask.order === null) {
                newTask.order = index;
                hasChanges = true;
                console.log(`      🔢 Added order field: ${index} for task "${newTask.id}"`);
              } else if (newTask.order !== index) {
                newTask.order = index;
                hasChanges = true;
                console.log(`      🔢 Updated order field: ${index} for task "${newTask.id}"`);
              }
              
              return newTask;
            });
            
            console.log(`    ✅ Fixed ${column.tasks.length} tasks in column "${column.name}"`);
            return { ...column, tasks: updatedTasks };
          } else {
            const needsOrderFix = column.tasks.some((task, index) => 
              task.order === undefined || task.order === null || task.order !== index
            );
            
            if (needsOrderFix) {
              console.log(`    🔢 Fixing order fields...`);
              const updatedTasks = column.tasks.map((task, index) => ({
                ...task,
                order: index
              }));
              hasChanges = true;
              console.log(`    ✅ Fixed order fields for ${column.tasks.length} tasks`);
              return { ...column, tasks: updatedTasks };
            } else {
              console.log(`    ✅ No changes needed`);
              return column;
            }
          }
        }
        return column;
      });
      
      if (hasChanges) {
        console.log(`  💾 Updating board: "${boardData.name}"`);
        await updateDoc(doc(db, 'boards', boardDoc.id), {
          columns: updatedColumns,
          updatedAt: new Date().toISOString()
        });
        console.log(`  ✅ Board updated successfully`);
      } else {
        console.log(`  ⏭️  No changes needed for board: "${boardData.name}"`);
      }
      console.log('');
    }
    
    console.log('🎉 Task ID and order fix completed successfully!');
    console.log('📋 All tasks now have unique IDs and proper order fields');
    console.log('🛡️  No tasks were deleted - all your data is preserved');
  }

  static async populateSampleData() {
    console.log('📝 POPULATING SAMPLE DATA');
    console.log('📋 Adding sample users, tags, and boards...\n');
    
    // Sample users
    const sampleUsers = [
      { id: 'user1', name: 'John Doe', email: 'john@example.com' },
      { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
      { id: 'user3', name: 'Mike Johnson', email: 'mike@example.com' },
      { id: 'user4', name: 'Sarah Wilson', email: 'sarah@example.com' },
    ];

    // Sample tags
    const sampleTags = [
      { id: 'tag1', name: 'Bug', color: '#EF4444', description: 'Issues that need fixing' },
      { id: 'tag2', name: 'Feature', color: '#3B82F6', description: 'New functionality' },
      { id: 'tag3', name: 'Enhancement', color: '#10B981', description: 'Improvements to existing features' },
      { id: 'tag4', name: 'Design', color: '#8B5CF6', description: 'UI/UX related tasks' },
      { id: 'tag5', name: 'Research', color: '#F59E0B', description: 'Investigation and analysis' },
    ];

    // Add users
    console.log('👥 Adding sample users...');
    for (const user of sampleUsers) {
      try {
        await addDoc(collection(db, 'users'), {
          ...user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`  ✅ Added user: ${user.name}`);
      } catch (error) {
        console.log(`  ⚠️  User ${user.name} might already exist`);
      }
    }

    // Add tags
    console.log('\n🏷️  Adding sample tags...');
    for (const tag of sampleTags) {
      try {
        await addDoc(collection(db, 'tags'), {
          ...tag,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`  ✅ Added tag: ${tag.name}`);
      } catch (error) {
        console.log(`  ⚠️  Tag ${tag.name} might already exist`);
      }
    }

    console.log('\n🎉 Sample data population completed!');
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case '--diagnose':
        await DataMigration.diagnoseDuplicates();
        break;
      case '--fix-duplicates':
        await DataMigration.fixDuplicates();
        break;
      case '--populate':
        await DataMigration.populateSampleData();
        break;
      default:
        console.log('📋 Data Migration Utility');
        console.log('');
        console.log('Usage: node data-migration/migrate.js [command]');
        console.log('');
        console.log('Commands:');
        console.log('  --diagnose        Check for duplicate task IDs (read-only)');
        console.log('  --fix-duplicates  Fix duplicate IDs and order fields');
        console.log('  --populate        Add sample users and tags');
        console.log('');
        console.log('Examples:');
        console.log('  node data-migration/migrate.js --diagnose');
        console.log('  node data-migration/migrate.js --fix-duplicates');
        console.log('  node data-migration/migrate.js --populate');
        break;
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
