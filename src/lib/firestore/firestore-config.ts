import { getFirestore } from 'firebase/firestore';
import { app } from '../firebase/firebase-config';

// Initialize Firestore
export const db = getFirestore(app);

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  GAMES: 'games',
  QUESTIONS: 'questions',
  SUBMISSIONS: 'submissions',
  TOPIC_COUNTS: 'topic_counts',
  QUIZZES: 'quizzes',
  QUIZ_QUESTIONS: 'quiz_questions',
  QUIZ_ANSWERS: 'quiz_answers',
};

// Document field names
export const FIELDS = {
  // User fields
  USER: {
    ID: 'id',
    NAME: 'name',
    EMAIL: 'email',
    EMAIL_VERIFIED: 'emailVerified',
    IMAGE: 'image',
    STRIPE_CUSTOMER_ID: 'stripeCustomerId',
    SUBSCRIBED: 'subscribed',
  },
  
  // Game fields
  GAME: {
    ID: 'id',
    USER_ID: 'userId',
    TIME_STARTED: 'timeStarted',
    TIME_ENDED: 'timeEnded',
    TOPIC: 'topic',
    GAME_TYPE: 'gameType',
  },
  
  // Question fields
  QUESTION: {
    ID: 'id',
    QUESTION: 'question',
    ANSWER: 'answer',
    GAME_ID: 'gameId',
    OPTIONS: 'options',
    PERCENTAGE_CORRECT: 'percentageCorrect',
    IS_CORRECT: 'isCorrect',
    QUESTION_TYPE: 'questionType',
    USER_ANSWER: 'userAnswer',
  },
  
  // Submission fields
  SUBMISSION: {
    ID: 'id',
    GAME_ID: 'gameId',
    SCORE: 'score',
    CREATED_AT: 'createdAt',
  },
  
  // Topic count fields
  TOPIC_COUNT: {
    ID: 'id',
    TOPIC: 'topic',
    COUNT: 'count',
  },
  
  // Quiz fields
  QUIZ: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    USER_ID: 'userId',
    CREATED_AT: 'createdAt',
  },
  
  // Quiz question fields
  QUIZ_QUESTION: {
    ID: 'id',
    QUIZZ_ID: 'quizzId',
    QUESTION_TEXT: 'questionText',
  },
  
  // Quiz answer fields
  QUIZ_ANSWER: {
    ID: 'id',
    QUESTION_ID: 'questionId',
    ANSWER_TEXT: 'answerText',
    IS_CORRECT: 'isCorrect',
  },
}; 