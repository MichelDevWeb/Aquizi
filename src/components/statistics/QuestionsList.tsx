"use client";
import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Define Firestore types
interface Question {
  id: string;
  question: string;
  answer: string;
  gameId: string;
  questionType: "mcq" | "open_ended";
  options?: string;
  userAnswer?: string;
  isCorrect?: boolean;
  percentageCorrect?: number;
}

type Props = {
  questions: Question[];
};

const QuestionsList = ({ questions }: Props) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4 md:p-6 space-y-0">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">Questions</CardTitle>
        <List className="h-4 w-4 sm:h-5 sm:w-5" />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        {/* Desktop view - Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableCaption>End of list.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>Question & Correct Answer</TableHead>
                <TableHead>Your Answer</TableHead>

                {questions[0].questionType === "open_ended" && (
                  <TableHead className="w-[100px] text-right">Accuracy</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map(
                (
                  { id, answer, question, userAnswer, percentageCorrect, isCorrect },
                  index
                ) => {
                  return (
                    <TableRow key={id || index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="mb-2">{question}</div>
                        <div className="font-semibold text-primary">Correct: {answer}</div>
                      </TableCell>
                      {questions[0].questionType === "open_ended" ? (
                        <TableCell className="font-semibold">
                          {userAnswer || "No answer provided"}
                        </TableCell>
                      ) : (
                        <TableCell
                          className={`${
                            isCorrect ? "text-green-600" : "text-red-600"
                          } font-semibold`}
                        >
                          {userAnswer || "No answer provided"}
                        </TableCell>
                      )}

                      {percentageCorrect !== undefined && (
                        <TableCell className="text-right font-medium">
                          {percentageCorrect}%
                        </TableCell>
                      )}
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile view - Accordion */}
        <div className="md:hidden">
          <Accordion type="multiple" value={expandedItems} className="w-full">
            {questions.map(
              (
                { id, answer, question, userAnswer, percentageCorrect, isCorrect },
                index
              ) => {
                const itemId = id || `question-${index}`;
                return (
                  <AccordionItem key={itemId} value={itemId} className="border-b">
                    <AccordionTrigger 
                      onClick={() => toggleItem(itemId)}
                      className="py-2 sm:py-3 px-1 hover:no-underline text-xs sm:text-sm"
                    >
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Badge variant="outline" className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex items-center justify-center rounded-full text-xs">
                            {index + 1}
                          </Badge>
                          <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-[180px]">
                            {question.length > 30 ? `${question.substring(0, 30)}...` : question}
                          </span>
                        </div>
                        {questions[0].questionType === "mcq" && (
                          <div className="flex-shrink-0">
                            {isCorrect ? (
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                            )}
                          </div>
                        )}
                        {questions[0].questionType === "open_ended" && percentageCorrect !== undefined && (
                          <Badge 
                            variant={percentageCorrect >= 70 ? "default" : "destructive"}
                            className="ml-auto text-[10px] sm:text-xs px-1 sm:px-2 h-5"
                          >
                            {percentageCorrect}%
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-2 sm:pb-3 pt-1">
                      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Question:</span>
                          <p className="mt-0.5 sm:mt-1">{question}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Correct Answer:</span>
                          <p className="mt-0.5 sm:mt-1 font-semibold text-primary">{answer}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Your Answer:</span>
                          <p className={`mt-0.5 sm:mt-1 font-semibold ${
                            questions[0].questionType === "mcq"
                              ? isCorrect ? "text-green-600" : "text-red-600"
                              : ""
                          }`}>
                            {userAnswer || "No answer provided"}
                          </p>
                        </div>
                        {questions[0].questionType === "open_ended" && percentageCorrect !== undefined && (
                          <div>
                            <span className="font-medium text-muted-foreground">Accuracy:</span>
                            <p className="mt-0.5 sm:mt-1 font-semibold">{percentageCorrect}%</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }
            )}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionsList;
