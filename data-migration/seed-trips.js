/**
 * Seed travel trips for a user.
 *
 * Usage:
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
 *   node data-migration/seed-trips.js <user-email>
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
  console.error("❌ Usage: node data-migration/seed-trips.js <user-email>");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(path.resolve(cred))) });
const db = admin.firestore();

const TRIPS = [
  {
    title: "Trip to Copenhagen",
    type: "personal",
    startDate: "2026-06-05",
    endDate: "2026-06-15",
    location: "Copenhagen",
    bookingRef: "Navan",
    details:
      "Booked on Navan\nFri 05/06 20:35 LHR → CPH\nMon 15/06 CPH → LHR",
  },
  {
    title: "Google I/O Connect Berlin 2026",
    type: "work",
    startDate: "2026-07-24",
    endDate: "2026-07-26",
    location: "Berlin",
    bookingRef: "287456",
    details:
      "Hotel: Park Inn by Radisson Berlin Alexanderplatz - £370.00\nFlight: London STN → Berlin 24/07 06:25 (Ryanair)\nBerlin → London 26/07 15:10",
  },
  {
    title: "Work trip - Dallas, Texas",
    type: "work",
    startDate: "2026-07-17",
    endDate: "2026-07-24",
    location: "Dallas, Texas",
    details:
      "Fri 17/07 LHR → DFW 12:35–17:05 (dep 12:55)\nFri 24/07 DFW → LHR 15:10 → 06:20",
  },
];

(async () => {
  const now = new Date().toISOString();
  // Avoid duplicates: skip if a trip with the same title already exists for the user.
  const existing = await db.collection("trips").where("ownerId", "==", userEmail).get();
  const titles = new Set(existing.docs.map((d) => d.data().title));

  let created = 0;
  for (const t of TRIPS) {
    if (titles.has(t.title)) {
      console.log(`  • exists, skipping: ${t.title}`);
      continue;
    }
    await db.collection("trips").add({ ...t, ownerId: userEmail, createdAt: now, updatedAt: now });
    created += 1;
    console.log(`  ✅ created: ${t.title} (${t.type})`);
  }
  console.log(`\n✨ Done. ${created} trips created for ${userEmail}.`);
  process.exit(0);
})().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
