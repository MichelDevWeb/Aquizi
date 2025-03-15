"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { History, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {};

const HistoryCard = (props: Props) => {
  const router = useRouter();
  const { t } = useLanguage();
  
  const handleClick = () => {
    router.push("/history");
  };
  
  return (
    <Card className="overflow-hidden border-2 hover:border-primary transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 space-y-0 bg-muted/50 p-2 sm:p-3 md:p-4">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">{t('history')}</CardTitle>
        <History className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" strokeWidth={2} />
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 md:pt-6 p-2 sm:p-3 md:p-4">
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 md:mb-4">
          {t('historyDesc')}
        </p>
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
            <li>{t('viewPastQuizzes')}</li>
            <li>{t('trackImprovement')}</li>
            <li>{t('retryQuizzes')}</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-1 sm:pt-2 pb-2 sm:pb-3 md:pb-4 px-2 sm:px-3 md:px-4">
        <Button 
          onClick={handleClick}
          className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9 md:h-10"
        >
          {t('viewHistory')}
          <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HistoryCard;
