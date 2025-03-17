import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Score } from "./types";
import { 
  BarChart3, 
  Trophy, 
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  Award,
  Star,
  TrendingUp,
  Medal,
  Clock,
  Check,
  X
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ScoresTabProps {
  scores: Score[];
  formatDate: (date: Date | null) => string;
  userId?: string;
}

export function ScoresTab({ scores, formatDate, userId }: ScoresTabProps) {
  const { t } = useLanguage();
  
  // Filter scores to only show current user's data if userId is provided
  const userScores = userId ? scores.filter(score => score.userId === userId) : scores;
  
  // Calculate best score
  const bestScore = userScores.length > 0 
    ? Math.max(...userScores.map(score => score.score))
    : 0;
    
  // Calculate average score
  const averageScore = userScores.length > 0 
    ? Math.round(userScores.reduce((sum, score) => sum + score.score, 0) / userScores.length)
    : 0;
    
  // Calculate improvement trend (comparing last score to average)
  const lastScore = userScores.length > 0 ? userScores[0].score : 0;
  const improvement = lastScore - averageScore;
  const hasImproved = improvement > 0;
  
  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t('yourScores')}
            </CardTitle>
            <CardDescription>{t('vocabularyMetrics')}</CardDescription>
          </CardHeader>
          <CardContent>
            {userScores.length > 0 ? (
              <div className="space-y-6">
                {/* Summary stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <motion.div 
                    className="space-y-1 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors duration-300"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t('totalGames')}
                    </p>
                    <p className="text-2xl font-bold">{userScores.length}</p>
                  </motion.div>
                  <motion.div 
                    className="space-y-1 p-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors duration-300"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-amber-500" />
                      {t('vocabBestScore')}
                    </p>
                    <p className="text-2xl font-bold flex items-center">
                      {bestScore}
                      <Medal className="h-4 w-4 text-amber-500 ml-1" />
                    </p>
                  </motion.div>
                  <motion.div 
                    className="space-y-1 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors duration-300"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {t('vocabAvgScore')}
                    </p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold">{averageScore}</p>
                      {improvement !== 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={cn(
                              "ml-2 text-xs px-1.5 py-0.5 rounded-full flex items-center",
                              hasImproved ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : 
                                          "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                            )}>
                              {hasImproved ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
                              {Math.abs(improvement)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {hasImproved ? t('improvement') : t('vocabAvgScore')}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </motion.div>
                </div>
                
                {/* Recent games */}
                <div>
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t('recentGames')}
                  </h3>
                  <Accordion type="multiple" className="space-y-3">
                    {userScores.slice(0, 5).map((score, index) => {
                      const correctPercentage = Math.round(
                        (score.wordsCorrect.length / (score.wordsCorrect.length + score.wordsIncorrect.length)) * 100
                      );
                      
                      return (
                        <AccordionItem 
                          key={score.id} 
                          value={score.id}
                          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-accent/50 transition-colors">
                              <div className="flex flex-1 items-center">
                                <div className={cn(
                                  "w-7 h-7 rounded-full flex items-center justify-center mr-2 text-xs font-medium shadow-sm",
                                  index === 0 ? "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 dark:from-amber-500 dark:to-amber-700 dark:text-amber-100" : 
                                  "bg-gradient-to-br from-primary/20 to-primary/30 text-primary"
                                )}>
                                  {index === 0 ? <Star className="h-3.5 w-3.5" /> : index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <p className="font-medium text-sm flex items-center">
                                        {t('score')}: {score.score}
                                        {index === 0 && (
                                          <Award className="h-3.5 w-3.5 text-amber-500 ml-1" />
                                        )}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {score.createdAt ? formatDate(new Date(score.createdAt)) : t('dateCompleted')}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 mr-2">
                                      <Badge variant="secondary" className="px-1.5 py-0 h-5 text-xs flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                        <Check className="h-3 w-3" />
                                        {score.wordsCorrect.length}
                                      </Badge>
                                      <Badge variant="outline" className="px-1.5 py-0 h-5 text-xs flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0">
                                        <X className="h-3 w-3" />
                                        {score.wordsIncorrect.length}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                                    <motion.div 
                                      className={cn(
                                        "h-full rounded-full",
                                        correctPercentage >= 80 ? "bg-gradient-to-r from-green-400 to-green-600" :
                                        correctPercentage >= 60 ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                                        "bg-gradient-to-r from-red-400 to-red-600"
                                      )}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${correctPercentage}%` }}
                                      transition={{ duration: 0.8, delay: index * 0.1 }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-3 pt-1">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                  <h4 className="text-xs font-medium flex items-center mb-2 text-green-700 dark:text-green-300">
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                    {t('correct')} ({score.wordsCorrect.length})
                                  </h4>
                                  {score.wordsCorrect.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                      {score.wordsCorrect.map((word, i) => (
                                        <div key={i} className="text-xs bg-white dark:bg-green-800/30 px-2 py-1 rounded border border-green-200 dark:border-green-800 flex items-center">
                                          <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                                          <span className="truncate">{word}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">{t('noCorrectWords')}</p>
                                  )}
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                  <h4 className="text-xs font-medium flex items-center mb-2 text-red-700 dark:text-red-300">
                                    <X className="h-3.5 w-3.5 mr-1" />
                                    {t('incorrect')} ({score.wordsIncorrect.length})
                                  </h4>
                                  {score.wordsIncorrect.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                      {score.wordsIncorrect.map((word, i) => (
                                        <div key={i} className="text-xs bg-white dark:bg-red-800/30 px-2 py-1 rounded border border-red-200 dark:border-red-800 flex items-center">
                                          <X className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
                                          <span className="truncate">{word}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">{t('noIncorrectWords')}</p>
                                  )}
                                </div>
                              </div>
                            </AccordionContent>
                          </motion.div>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </div>
            ) : (
              <motion.div 
                className="text-center py-8 sm:py-10 px-4 sm:px-6 rounded-lg bg-primary/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <BarChart3 className="h-12 sm:h-16 w-12 sm:w-16 text-primary/50 mx-auto mb-4" />
                </motion.div>
                <p className="text-base sm:text-lg font-medium mb-2">{t('noQuizzesYet')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">{t('noQuizzesDesc')}</p>
                <motion.button
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('quiz')}
                </motion.button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
} 