"use client";

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firestore/firestore-config';

type Submission = {
  score: number;
  gameId: string;
  userId: string;
  timeSpent?: number;
};

export async function saveSubmission(submission: Submission): Promise<string> {
  try {
    const { score, gameId, userId, timeSpent } = submission;
    
    console.log('Saving submission with data:', { score, gameId, userId, timeSpent });
    
    if (!gameId) {
      console.error('Error: gameId is required for submission');
      throw new Error('gameId is required for submission');
    }
    
    if (!userId) {
      console.error('Error: userId is required for submission');
      throw new Error('userId is required for submission');
    }

    const submissionData = {
      score,
      gameId,
      userId,
      timeSpent: timeSpent || 0,
      createdAt: serverTimestamp()
    };
    
    console.log('Creating submission document with data:', submissionData);
    
    const submissionRef = await addDoc(
      collection(db, COLLECTIONS.SUBMISSIONS), 
      submissionData
    );
    
    console.log('Submission created successfully with ID:', submissionRef.id);

    return submissionRef.id;
  } catch (error) {
    console.error('Error saving submission:', error);
    throw error;
  }
}
