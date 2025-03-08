import { useEffect } from "react";
import Bar from "@/components/Bar";
import Image from "next/image";
import { useReward } from "react-rewards";
import { ChevronLeft, X, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  scorePercentage: number;
  score: number;
  totalQuestions: number;
  submissionId?: string;
  onRetest?: () => void;
};

const QuizzSubmission = (props: Props) => {
  const { scorePercentage, score, totalQuestions, submissionId, onRetest } = props;
  const { reward } = useReward("rewardId", "confetti");
  const router = useRouter();

  useEffect(() => {
    if (scorePercentage === 100) {
      reward();
    }
  }, [scorePercentage, reward]);

  const onHandleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="position-sticky top-0 z-10 shadow-md py-4 w-full">
        <header className="flex items-center justify-end py-2 gap-2">
          {onRetest && submissionId && (
            <Button
              onClick={onRetest}
              size="icon"
              variant="outline"
              title="Retest"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={onHandleBack}
            size="icon"
            variant="outline"
          >
            <X />
          </Button>
        </header>
      </div>
      <main className="py-11 flex flex-col gap-4 items-center flex-1 mt-24">
        <h2 className="text-3xl font-bold">Quizz Complete!</h2>
        <p>You scored: {scorePercentage}%</p>
        {scorePercentage === 100 ? (
          <div className="flex flex-col items-center">
            <p>Congratulations! 🎉</p>
            <div className="flex justify-center">
              <Image
                src="/images/owl-smiling.png"
                alt="Smiling Owl Image"
                width={400}
                height={400}
              />
            </div>
            <span id="rewardId" />
          </div>
        ) : (
          <>
            <div className="flex flex-row gap-8 mt-6">
              <Bar
                percentage={scorePercentage}
                color="green"
              />
              <Bar
                percentage={100 - scorePercentage}
                color="red"
              />
            </div>
            <div className="flex flex-row gap-8">
              <p>{score} Correct</p>
              <p>{totalQuestions - score} Incorrect</p>
            </div>
            {onRetest && submissionId && (
              <Button
                onClick={onRetest}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retest
              </Button>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default QuizzSubmission;
