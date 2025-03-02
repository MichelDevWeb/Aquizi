import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc,
  Timestamp,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore';
import { db, COLLECTIONS, FIELDS } from './firestore-config';

// Generic function to get a document by ID
export async function getDocumentById<T>(
  collectionName: string, 
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to get documents with query
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as T[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to create a document with auto-generated ID
export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to create a document with specific ID
export async function createDocumentWithId<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error creating document with ID in ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to update a document
export async function updateDocument<T extends Partial<DocumentData>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

// Generic function to delete a document
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

// Convert Firebase Timestamp to Date
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

// Convert Date to Firebase Timestamp
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

// Helper to get a reference to a collection
export function getCollectionRef<T = DocumentData>(
  collectionName: string
): CollectionReference<T> {
  return collection(db, collectionName) as CollectionReference<T>;
}

// Helper to get a reference to a document
export function getDocumentRef<T = DocumentData>(
  collectionName: string,
  docId: string
): DocumentReference<T> {
  return doc(db, collectionName, docId) as DocumentReference<T>;
} 