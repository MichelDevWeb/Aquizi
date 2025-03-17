import React from "react";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, BarChart2, Award } from "lucide-react";
import { Score } from "./types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProgressTrackerProps {
  scores: Score[];
}

export function ProgressTracker({ scores }: ProgressTrackerProps) {
  const { t, language } = useLanguage();
  
  // Calculate stats
  const totalWordsLearned = scores.reduce((sum, s) => sum + s.wordsCorrect.length, 0);
  const totalWordsAttempted = scores.reduce(
    (sum, s) => sum + s.wordsCorrect.length + s.wordsIncorrect.length, 0
  );
  const averageAccuracy = totalWordsAttempted > 0 
    ? Math.round((totalWordsLearned / totalWordsAttempted) * 100) 
    : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"></path><path d="M19 17V5a2 2 0 0 0-2-2H4"></path><path d="M15 8h-5"></path><path d="M15 12h-5"></path></svg>
          {t('totalWordsLearned')}
        </span>
        <span className="font-bold">{totalWordsLearned}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" />
          {t('averageAccuracy')}
        </span>
        <span className="font-bold">{averageAccuracy}%</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-primary" />
          {t('vocabBestScore')}
        </span>
        <span className="font-bold">{bestScore}</span>
      </div>
      <div className="mt-2">
        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
          <BarChart2 className="h-3.5 w-3.5 text-primary" />
          {t('learningProgress')}
        </p>
        <Progress 
          value={Math.min((totalWordsLearned / 100) * 100, 100)} 
          className="h-2" 
        />
        <p className="text-xs text-right mt-1 text-muted-foreground">
          {totalWordsLearned} {t('words')}
        </p>
      </div>
    </div>
  );
} 