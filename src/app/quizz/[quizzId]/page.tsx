import { getDocumentById, getDocuments } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { where } from "firebase/firestore";
import QuizzQuestions from "../QuizzQuestions";

// Define Firestore types
interface Quizz {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
  questions: Question[];
}

interface Question {
  id: string;
  quizzId: string;
  questionText: string;
  answers: Answer[];
}

interface Answer {
  id: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
}

const page = async ({
  params,
}: {
  params: {
    quizzId: string;
  };
}) => {
  const quizzId = params.quizzId;
  
  // Get quizz from Firestore
  const quizz = await getDocumentById<Quizz>(COLLECTIONS.QUIZZES, quizzId);
  
  if (!quizz) {
    return <div>Quizz not found</div>;
  }
  
  // Get questions for the quizz
  const questions = await getDocuments<Question>(
    COLLECTIONS.QUIZ_QUESTIONS,
    [where(FIELDS.QUIZ_QUESTION.QUIZZ_ID, "==", quizzId)]
  );
  
  if (questions.length === 0) {
    return <div>Quizz has no questions</div>;
  }
  
  // Get answers for each question
  const questionIds = questions.map(q => q.id);
  const answers = await getDocuments<Answer>(
    COLLECTIONS.QUIZ_ANSWERS,
    [where(FIELDS.QUIZ_ANSWER.QUESTION_ID, "in", questionIds)]
  );
  
  // Combine questions with their answers
  const questionsWithAnswers = questions.map(question => ({
    ...question,
    answers: answers.filter(answer => answer.questionId === question.id)
  }));
  
  // Combine quizz with questions and answers
  const quizzWithQuestions = {
    ...quizz,
    questions: questionsWithAnswers
  };

  return <QuizzQuestions quizz={quizzWithQuestions} />;
};

export default page;
