"use client";

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firestore/firestore-config';

type Submission = {
  score: number;
  gameId: string;
  userId: string;
};

export async function saveSubmission(submission: Submission): Promise<string> {
  try {
    const { score, gameId, userId } = submission;

    const submissionRef = await addDoc(collection(db, COLLECTIONS.SUBMISSIONS), {
      score,
      gameId,
      userId,
      createdAt: serverTimestamp()
    });

    return submissionRef.id;
  } catch (error) {
    console.error('Error saving submission:', error);
    throw error;
  }
}
