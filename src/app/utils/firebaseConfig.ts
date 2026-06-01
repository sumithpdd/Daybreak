// Re-export the single shared Firestore instance so the kanban code keeps its
// existing import path while we avoid initialising Firebase twice.
export { db } from "@/lib/firebase";
