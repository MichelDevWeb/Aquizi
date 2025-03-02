import { collection, query, where, getDocs, getDoc, doc, count } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firestore/firestore-config';

const getUserMetrics = async (userId?: string) => {
  if (!userId) {
    return null;
  }

  try {
    // Get total # of user games (quizzes)
    const gamesQuery = query(
      collection(db, COLLECTIONS.GAMES),
      where('userId', '==', userId)
    );
    const gamesSnapshot = await getDocs(gamesQuery);
    const numQuizzes = gamesSnapshot.size;

    // Get total # of questions
    const questionsQuery = query(
      collection(db, COLLECTIONS.QUESTIONS),
      where('userId', '==', userId)
    );
    const questionsSnapshot = await getDocs(questionsQuery);
    const numQuestions = questionsSnapshot.size;

    // Get total # of submissions
    const submissionsQuery = query(
      collection(db, COLLECTIONS.SUBMISSIONS),
      where('userId', '==', userId)
    );
    const submissionsSnapshot = await getDocs(submissionsQuery);
    const numSubmissions = submissionsSnapshot.size;

    // Calculate average score
    let totalScore = 0;
    submissionsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.score) {
        totalScore += data.score;
      }
    });
    const avgScore = numSubmissions > 0 ? totalScore / numSubmissions : 0;

    return [
      { label: "Quizzes", value: numQuizzes },
      { label: "Questions", value: numQuestions },
      { label: "Submissions", value: numSubmissions },
      { label: "Average Score", value: Math.round(avgScore * 100) / 100 },
    ];
  } catch (error) {
    console.error("Error fetching user metrics:", error);
    return [
      { label: "Quizzes", value: 0 },
      { label: "Questions", value: 0 },
      { label: "Submissions", value: 0 },
      { label: "Average Score", value: 0 },
    ];
  }
};

export default getUserMetrics;
