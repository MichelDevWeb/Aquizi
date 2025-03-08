"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { BrainCircuit, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {};

const QuizMeCard = (props: Props) => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push("/quiz");
  };
  
  return (
    <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-muted/50">
        <CardTitle className="text-xl sm:text-2xl font-bold">Quiz Me!</CardTitle>
        <BrainCircuit className="h-6 w-6 sm:h-8 sm:w-8 text-primary" strokeWidth={2} />
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-4">
          Challenge yourself with a quiz on any topic of your choice. Test your knowledge and improve your skills!
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Multiple choice questions</li>
            <li>Open-ended questions</li>
            <li>Track your progress</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <Button 
          onClick={handleClick}
          className="w-full sm:w-auto"
        >
          Start Quiz
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizMeCard;
