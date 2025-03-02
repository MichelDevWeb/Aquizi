// Re-export Firestore configuration
import { db as firestoreDb, COLLECTIONS, FIELDS } from '@/lib/firestore/firestore-config';

// Export Firestore db as the default db
export const db = firestoreDb;

// Export collections and fields
export { COLLECTIONS, FIELDS };
