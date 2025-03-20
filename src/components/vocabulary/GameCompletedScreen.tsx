import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Score } from "./types";
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
  Star,
  Share2,
  Plus
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface GameCompletedScreenProps {
  score: Score;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function GameCompletedScreen({
  score,
  onPlayAgain,
  onNewGame
}: GameCompletedScreenProps) {
  const { t } = useLanguage();

  // Calculate accuracy percentage
  const totalWords = score.wordsCorrect.length + score.wordsIncorrect.length;
  const accuracyPercentage = Math.round((score.wordsCorrect.length / totalWords) * 100);

  // Get performance message based on accuracy
  const getPerformanceMessage = () => {
    if (accuracyPercentage >= 90) return t('greatPerformance');
    if (accuracyPercentage >= 70) return t('goodPerformance');
    return t('needsPractice');
  };

  const shareResults = () => {
    const text = `🎯 ${t('gameCompleted')}\n📊 ${t('score')}: ${score.score}\n✅ ${t('correct')}: ${score.wordsCorrect.length}\n❌ ${t('incorrect')}: ${score.wordsIncorrect.length}\n🎯 ${t('accuracy')}: ${accuracyPercentage}%\n\n🌟 ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3"
          >
            <Trophy className="h-8 w-8 text-primary" />
          </motion.div>
          <CardTitle className="text-3xl flex items-center justify-center gap-2 mb-2">
            {t('gameCompleted')}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Sparkles className="h-6 w-6 text-amber-500" />
            </motion.div>
          </CardTitle>
          <CardDescription className="text-lg">{getPerformanceMessage()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-muted/30 rounded-lg p-6 text-center"
          >
            <div className="flex justify-center items-center gap-3 mb-4">
              <Star className="h-6 w-6 text-amber-500" />
              <h3 className="text-2xl font-bold">{t('finalScore')}: {score.score}</h3>
              <Star className="h-6 w-6 text-amber-500" />
            </div>

            <div className="flex justify-center items-center gap-4 mb-6">
              <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {score.wordsCorrect.length} {t('correct')}
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                {score.wordsIncorrect.length} {t('incorrect')}
              </Badge>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-sm font-medium">
                <span>{t('accuracy')}</span>
                <span>{accuracyPercentage}%</span>
              </div>
              <Progress
                value={accuracyPercentage}
                className={cn(
                  "h-3 rounded-full transition-all",
                  accuracyPercentage >= 80 ? "bg-green-200 dark:bg-green-900" :
                  accuracyPercentage >= 60 ? "bg-amber-200 dark:bg-amber-900" :
                  "bg-red-200 dark:bg-red-900"
                )}
              />
            </div>
          </motion.div>

          {/* Words summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Correct words */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-green-200 dark:border-green-900 transition-colors hover:bg-green-50 dark:hover:bg-green-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    {t('correct')} ({score.wordsCorrect.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {score.wordsCorrect.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {score.wordsCorrect.map((word) => (
                        <Badge key={word} variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('noCorrectWords')}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Incorrect words */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-red-200 dark:border-red-900 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-600" />
                    {t('incorrect')} ({score.wordsIncorrect.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {score.wordsIncorrect.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {score.wordsIncorrect.map((word) => (
                        <Badge key={word} variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('noIncorrectWords')}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary/5 rounded-lg p-4"
          >
            <h3 className="font-medium text-sm mb-2 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" />
              {t('performance')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {accuracyPercentage >= 80
                ? t('greatPerformance')
                : accuracyPercentage >= 60
                  ? t('goodPerformance')
                  : t('needsPractice')}
            </p>
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 justify-center pt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onPlayAgain}
                  className="flex-1 max-w-[200px] gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('playAgain')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('playAgainTooltip')}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onNewGame}
                  className="flex-1 max-w-[200px] gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('newGame')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('newGameTooltip')}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  onClick={shareResults}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {t('shareResults')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('shareTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 