/**
 * Seed tags and assign them to a user's existing board tasks so tags are
 * visible on the cards.
 *
 * Usage:
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
 *   node data-migration/seed-tags.js <user-email>
 */

const admin = require("firebase-admin");
const path = require("path");

const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!cred) {
  console.error("❌ GOOGLE_APPLICATION_CREDENTIALS not set");
  process.exit(1);
}
const userEmail = process.argv[2];
if (!userEmail) {
  console.error("❌ Usage: node data-migration/seed-tags.js <user-email>");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(path.resolve(cred))) });
const db = admin.firestore();

const TAGS = [
  { name: "Work", color: "#2d9cef", description: "Day-job work" },
  { name: "Personal", color: "#10b981", description: "Personal goals" },
  { name: "Urgent", color: "#ef4444", description: "Needs attention now" },
  { name: "Learning", color: "#8b5cf6", description: "Skills and study" },
  { name: "Customer", color: "#f59e0b", description: "Customer facing" },
  { name: "Admin", color: "#6b7280", description: "Admin and ops" },
];

(async () => {
  const now = new Date().toISOString();

  // Reuse existing tags by name, create any that are missing.
  const existing = await db.collection("tags").get();
  const byName = new Map(existing.docs.map((d) => [String(d.data().name).toLowerCase(), d.id]));

  const tagIds = [];
  for (const t of TAGS) {
    const found = byName.get(t.name.toLowerCase());
    if (found) {
      tagIds.push(found);
      console.log(`  • tag exists: ${t.name}`);
    } else {
      const ref = await db.collection("tags").add({ ...t, createdAt: now, updatedAt: now });
      tagIds.push(ref.id);
      console.log(`  ✅ created tag: ${t.name}`);
    }
  }

  // Assign 1-2 tags to each task, round-robin, on the user's boards.
  const boards = await db.collection("boards").where("ownerId", "==", userEmail).get();
  let taskCount = 0;
  for (const boardDoc of boards.docs) {
    const board = boardDoc.data();
    let i = 0;
    const columns = (board.columns || []).map((col) => ({
      ...col,
      tasks: (col.tasks || []).map((task) => {
        const a = tagIds[i % tagIds.length];
        const b = tagIds[(i + 2) % tagIds.length];
        i += 1;
        taskCount += 1;
        return { ...task, tags: [a, b], updatedAt: now };
      }),
    }));
    await boardDoc.ref.update({ columns, updatedAt: now });
    console.log(`  ✅ tagged ${taskCount} tasks on board "${board.name}"`);
  }

  console.log(`\n✨ Done. ${tagIds.length} tags available, ${taskCount} tasks tagged.`);
  process.exit(0);
})().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
