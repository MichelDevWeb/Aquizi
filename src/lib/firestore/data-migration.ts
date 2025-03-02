import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db, COLLECTIONS, FIELDS } from './firestore-config';

/**
 * Migrates a user from Drizzle to Firestore
 */
export async function migrateUser(user: any): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), {
      [FIELDS.USER.ID]: user.id,
      [FIELDS.USER.NAME]: user.name || null,
      [FIELDS.USER.EMAIL]: user.email,
      [FIELDS.USER.EMAIL_VERIFIED]: user.emailVerified ? Timestamp.fromDate(new Date(user.emailVerified)) : null,
      [FIELDS.USER.IMAGE]: user.image || null,
      [FIELDS.USER.STRIPE_CUSTOMER_ID]: user.stripeCustomerId || null,
      [FIELDS.USER.SUBSCRIBED]: user.subscribed || false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error migrating user:', error);
    throw error;
  }
}

/**
 * Migrates a game from Drizzle to Firestore
 */
export async function migrateGame(game: any): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.GAMES, game.id), {
      [FIELDS.GAME.ID]: game.id,
      [FIELDS.GAME.USER_ID]: game.userId,
      [FIELDS.GAME.TIME_STARTED]: game.timeStarted ? Timestamp.fromDate(new Date(game.timeStarted)) : null,
      [FIELDS.GAME.TIME_ENDED]: game.timeEnded ? Timestamp.fromDate(new Date(game.timeEnded)) : null,
      [FIELDS.GAME.TOPIC]: game.topic,
      [FIELDS.GAME.GAME_TYPE]: game.gameType,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error migrating game:', error);
    throw error;
  }
}

/**
 * Migrates a question from Drizzle to Firestore
 */
export async function migrateQuestion(question: any): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.QUESTIONS, question.id), {
      [FIELDS.QUESTION.ID]: question.id,
      [FIELDS.QUESTION.QUESTION]: question.question,
      [FIELDS.QUESTION.ANSWER]: question.answer,
      [FIELDS.QUESTION.GAME_ID]: question.gameId,
      [FIELDS.QUESTION.OPTIONS]: question.options || null,
      [FIELDS.QUESTION.PERCENTAGE_CORRECT]: question.percentageCorrect || null,
      [FIELDS.QUESTION.IS_CORRECT]: question.isCorrect || false,
      [FIELDS.QUESTION.QUESTION_TYPE]: question.questionType,
      [FIELDS.QUESTION.USER_ANSWER]: question.userAnswer || null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error migrating question:', error);
    throw error;
  }
}

/**
 * Migrates a submission from Drizzle to Firestore
 */
export async function migrateSubmission(submission: any, userId: string): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.SUBMISSIONS, submission.id.toString()), {
      [FIELDS.SUBMISSION.ID]: submission.id.toString(),
      [FIELDS.SUBMISSION.GAME_ID]: submission.quizzId.toString(),
      [FIELDS.SUBMISSION.SCORE]: submission.score,
      [FIELDS.SUBMISSION.CREATED_AT]: submission.createdAt ? Timestamp.fromDate(new Date(submission.createdAt)) : serverTimestamp(),
      userId: userId, // Add userId for easier querying
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error migrating submission:', error);
    throw error;
  }
}

/**
 * Migrates a topic count from Drizzle to Firestore
 */
export async function migrateTopicCount(topicCount: any): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.TOPIC_COUNTS, topicCount.id), {
      [FIELDS.TOPIC_COUNT.ID]: topicCount.id,
      [FIELDS.TOPIC_COUNT.TOPIC]: topicCount.topic,
      [FIELDS.TOPIC_COUNT.COUNT]: topicCount.count,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error migrating topic count:', error);
    throw error;
  }
}

/**
 * Batch migrates multiple documents to Firestore
 */
export async function batchMigrate(collectionName: string, documents: any[]): Promise<void> {
  try {
    const batchSize = 500; // Firestore batch limit is 500
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = documents.slice(i, i + batchSize);
      
      chunk.forEach(doc => {
        const docRef = doc(db, collectionName, doc.id.toString());
        batch.set(docRef, {
          ...doc,
          createdAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
      console.log(`Migrated batch ${i / batchSize + 1} of ${Math.ceil(documents.length / batchSize)}`);
    }
  } catch (error) {
    console.error('Error batch migrating documents:', error);
    throw error;
  }
} 