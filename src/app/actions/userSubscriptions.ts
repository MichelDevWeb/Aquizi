'use client';

import { doc, getDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS, FIELDS } from '@/lib/firestore/firestore-config';

export async function createSubscription({
  stripeCustomerId,
}: {
  stripeCustomerId: string;
}): Promise<void> {
  try {
    // Find the user with the given stripeCustomerId
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where(FIELDS.USER.STRIPE_CUSTOMER_ID, '==', stripeCustomerId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error('No user found with the provided Stripe customer ID');
      return;
    }
    
    // Update the user's subscription status
    const userDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, COLLECTIONS.USERS, userDoc.id), {
      [FIELDS.USER.SUBSCRIBED]: true
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function deleteSubscription({
  stripeCustomerId,
}: {
  stripeCustomerId: string;
}): Promise<void> {
  try {
    // Find the user with the given stripeCustomerId
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where(FIELDS.USER.STRIPE_CUSTOMER_ID, '==', stripeCustomerId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error('No user found with the provided Stripe customer ID');
      return;
    }
    
    // Update the user's subscription status
    const userDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, COLLECTIONS.USERS, userDoc.id), {
      [FIELDS.USER.SUBSCRIBED]: false
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
}

export async function getUserSubscription({ userId }: { userId: string }): Promise<boolean | null> {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    return userData[FIELDS.USER.SUBSCRIBED] || false;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return false;
  }
}
