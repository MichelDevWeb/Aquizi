import { getDocumentById, getDocuments } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { where } from "firebase/firestore";
import QuizzQuestions from "../QuizzQuestions";
import { Suspense } from "react";

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

interface PageProps {
  params: {
    quizzId: string;
  };
  searchParams: {
    retest?: string;
    submissionId?: string;
  };
}

const page = async ({ params, searchParams }: PageProps) => {
  const quizzId = params.quizzId;
  const isRetest = searchParams.retest === 'true';
  const submissionId = searchParams.submissionId;
  
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

  return (
    <Suspense fallback={<div>Loading quiz...</div>}>
      <QuizzQuestions 
        quizz={quizzWithQuestions} 
        submissionId={submissionId}
      />
    </Suspense>
  );
};

export default page;
