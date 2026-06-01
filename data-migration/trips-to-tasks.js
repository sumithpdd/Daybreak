/**
 * Convert trips (from the trips collection) into trip-type tasks on the user's
 * "My Personal Tasks" board, creating the board if needed, then remove the
 * standalone trip documents. Trips are just a special kind of task.
 *
 * Usage:
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
 *   node data-migration/trips-to-tasks.js <user-email> [board-name]
 */

const admin = require("firebase-admin");
const path = require("path");

const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!cred) {
  console.error("❌ GOOGLE_APPLICATION_CREDENTIALS not set");
  process.exit(1);
}
const userEmail = process.argv[2];
const boardName = process.argv[3] || "My Personal Tasks";
if (!userEmail) {
  console.error("❌ Usage: node data-migration/trips-to-tasks.js <user-email> [board-name]");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(path.resolve(cred))) });
const db = admin.firestore();
const uid = (p = "") => `${p}${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

(async () => {
  const now = new Date().toISOString();

  // 1. Find or create the board.
  const boardsSnap = await db.collection("boards").where("ownerId", "==", userEmail).get();
  let boardDoc = boardsSnap.docs.find((d) => d.data().name === boardName);
  if (!boardDoc) {
    const ref = await db.collection("boards").add({
      name: boardName,
      description: "Personal tasks and trips",
      ownerId: userEmail,
      owners: [userEmail],
      members: [],
      columns: [
        { id: uid("col-"), name: "To Do", tasks: [] },
        { id: uid("col-"), name: "In Progress", tasks: [] },
        { id: uid("col-"), name: "Done", tasks: [] },
      ],
      createdAt: now,
      updatedAt: now,
    });
    boardDoc = await ref.get();
    console.log(`  ✅ created board "${boardName}"`);
  } else {
    console.log(`  • using existing board "${boardName}"`);
  }

  const board = boardDoc.data();
  const columns = board.columns || [];
  const todo = columns.find((c) => /to ?do/i.test(c.name)) || columns[0];
  const existingTitles = new Set(columns.flatMap((c) => (c.tasks || []).map((t) => t.title)));

  // 2. Read trips and convert each into a trip-type task.
  const tripsSnap = await db.collection("trips").where("ownerId", "==", userEmail).get();
  let added = 0;
  for (const tripDocSnap of tripsSnap.docs) {
    const trip = tripDocSnap.data();
    if (existingTitles.has(trip.title)) {
      console.log(`  • task already exists, skipping: ${trip.title}`);
    } else {
      const descLines = [];
      if (trip.location) descLines.push(`<strong>${trip.location}</strong>`);
      if (trip.bookingRef) descLines.push(`Booking: ${trip.bookingRef}`);
      if (trip.details) descLines.push(String(trip.details).replace(/\n/g, "<br>"));
      todo.tasks.push({
        id: uid("task-"),
        title: trip.title,
        description: descLines.join("<br>"),
        status: todo.name,
        order: todo.tasks.length,
        tags: [],
        assignedTo: [],
        startDate: trip.startDate,
        dueDate: trip.endDate,
        type: "trip",
        location: trip.location || "",
        bookingRef: trip.bookingRef || "",
        timeSpent: 0,
        createdAt: now,
        createdBy: userEmail,
        updatedAt: now,
        updatedBy: userEmail,
      });
      added += 1;
      console.log(`  ✅ added trip task: ${trip.title}`);
    }
    // 3. Remove the standalone trip document.
    await tripDocSnap.ref.delete();
  }

  await boardDoc.ref.update({ columns, updatedAt: now });
  console.log(`\n✨ Done. ${added} trip tasks added to "${boardName}"; standalone trips removed.`);
  process.exit(0);
})().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
