import { collection, query, where, getDocs, getDoc, doc, limit, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firestore/firestore-config';

/**
 * Get essential user metrics for dashboard display
 * @param userId The user ID to fetch metrics for
 * @returns An array of key metrics or null if no user ID provided
 */
const getUserMetrics = async (userId?: string) => {
  if (!userId) {
    return null;
  }

  try {
    // Use Promise.all to fetch data in parallel
    const [quizCount, recentSubmissions] = await Promise.all([
      // Get quiz count (most important metric)
      getDocs(
        query(
          collection(db, COLLECTIONS.GAMES),
          where('userId', '==', userId)
        )
      ),
      
      // Get only recent submissions (limited to 10) for performance
      getDocs(
        query(
          collection(db, COLLECTIONS.SUBMISSIONS),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(10)
        )
      )
    ]);

    // Calculate metrics from the results
    const numQuizzes = quizCount.size;
    
    // Calculate average score from recent submissions
    let totalScore = 0;
    let totalQuestions = 0;
    
    recentSubmissions.forEach((doc) => {
      const data = doc.data();
      if (data.score) {
        totalScore += data.score;
        totalQuestions += data.totalQuestions || 1; // Fallback to 1 if totalQuestions is missing
      }
    });
    
    const submissionCount = recentSubmissions.size;
    const avgScore = submissionCount > 0 ? totalScore / submissionCount : 0;
    const avgQuestionsPerQuiz = numQuizzes > 0 && totalQuestions > 0 ? 
      totalQuestions / Math.min(numQuizzes, submissionCount) : 0;

    // Return only the most important metrics with translation keys
    return [
      { label: "quizzesLabel", value: numQuizzes },
      { label: "recentSubmissionsLabel", value: submissionCount },
      { label: "averageScoreLabel", value: Math.round(avgScore * 100) / 100 },
      { label: "avgQuestionsPerQuizLabel", value: Math.round(avgQuestionsPerQuiz) }
    ];
  } catch (error) {
    console.error("Error fetching user metrics:", error);
    // Return fallback data with translation keys
    return [
      { label: "quizzesLabel", value: 0 },
      { label: "recentSubmissionsLabel", value: 0 },
      { label: "averageScoreLabel", value: 0 },
      { label: "avgQuestionsPerQuizLabel", value: 0 }
    ];
  }
};

export default getUserMetrics;
