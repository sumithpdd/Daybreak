/**
 * Merge a user's boards that have the same name (ignoring extra whitespace and
 * case). The oldest board is kept as the primary; tasks from the duplicates are
 * appended into matching columns (by name) and the duplicates are deleted.
 *
 * Usage:
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
 *   node data-migration/merge-duplicate-boards.js <user-email>
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
  console.error("❌ Usage: node data-migration/merge-duplicate-boards.js <user-email>");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(path.resolve(cred))) });
const db = admin.firestore();

const norm = (s) => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();
const clean = (s) => String(s || "").trim().replace(/\s+/g, " ");

(async () => {
  const snap = await db.collection("boards").where("ownerId", "==", userEmail).get();
  const boards = snap.docs
    .map((d) => ({ id: d.id, ref: d.ref, ...d.data() }))
    .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));

  // Group by normalized name.
  const groups = new Map();
  for (const b of boards) {
    const key = norm(b.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(b);
  }

  let mergedGroups = 0;
  for (const [, group] of groups) {
    if (group.length < 2) continue;
    mergedGroups += 1;
    const primary = group[0]; // oldest
    const dups = group.slice(1);
    const columns = primary.columns || [];
    const existingIds = new Set(columns.flatMap((c) => (c.tasks || []).map((t) => t.id)));

    for (const dup of dups) {
      for (const dcol of dup.columns || []) {
        let target = columns.find((c) => norm(c.name) === norm(dcol.name));
        if (!target) {
          target = { id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: clean(dcol.name), tasks: [] };
          columns.push(target);
        }
        for (const task of dcol.tasks || []) {
          if (existingIds.has(task.id)) continue;
          existingIds.add(task.id);
          target.tasks.push({ ...task, status: target.name, order: target.tasks.length });
        }
      }
      console.log(`  ✅ merged "${dup.name}" (${dup.id}) into "${primary.name}" (${primary.id})`);
      await dup.ref.delete();
    }

    await primary.ref.update({ name: clean(primary.name), columns, updatedAt: new Date().toISOString() });
    console.log(`  ✅ kept "${clean(primary.name)}" (${primary.id}) with ${columns.reduce((n, c) => n + (c.tasks || []).length, 0)} tasks`);
  }

  console.log(mergedGroups === 0 ? "\nNo duplicate-named boards found." : `\n✨ Done. Merged ${mergedGroups} duplicate group(s).`);
  process.exit(0);
})().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
