"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { History, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {};

const HistoryCard = (props: Props) => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push("/history");
  };
  
  return (
    <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-muted/50">
        <CardTitle className="text-xl sm:text-2xl font-bold">History</CardTitle>
        <History className="h-6 w-6 sm:h-8 sm:w-8 text-primary" strokeWidth={2} />
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-4">
          View your quiz history and track your progress over time. Analyze your performance and identify areas for improvement.
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>View past quiz attempts</li>
            <li>Track your improvement</li>
            <li>Retry previous quizzes</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <Button 
          onClick={handleClick}
          className="w-full sm:w-auto"
        >
          View History
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HistoryCard;
