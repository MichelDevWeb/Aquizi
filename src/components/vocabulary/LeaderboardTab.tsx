import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Crown, Calendar, Users, Award, ArrowRight, Star, Check, X } from "lucide-react";
import { Score } from "./types";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface LeaderboardTabProps {
  leaderboard: Score[];
  userId?: string;
  formatDate: (date: Date | null) => string;
  navigateToGameTab: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const podiumAnimation = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

export function LeaderboardTab({ 
  leaderboard, 
  userId, 
  formatDate, 
  navigateToGameTab 
}: LeaderboardTabProps) {
  const { t } = useLanguage();
  
  // Process leaderboard to get unique best scores by user
  const processedLeaderboard = useMemo(() => {
    // Get the best score for each user
    const userBestScores = new Map<string, Score>();
    
    leaderboard.forEach(score => {
      const existingScore = userBestScores.get(score.userId);
      
      // Calculate average score (score / total words)
      const totalWords = score.wordsCorrect.length + score.wordsIncorrect.length;
      const avgScore = totalWords > 0 ? score.score / totalWords : 0;
      
      if (!existingScore) {
        userBestScores.set(score.userId, {
          ...score,
          // Store the calculated average for sorting
          _avgScore: avgScore
        } as Score & { _avgScore: number });
      } else {
        // Always compare by score first, then by average if scores are equal
        if (score.score > existingScore.score || 
            (score.score === existingScore.score && avgScore > ((existingScore as Score & { _avgScore: number })._avgScore || 0))) {
          userBestScores.set(score.userId, {
            ...score,
            _avgScore: avgScore
          } as Score & { _avgScore: number });
        }
      }
    });
    
    // Convert map to array and sort by score
    return Array.from(userBestScores.values())
      .sort((a, b) => {
        // Primary sort by score
        if (b.score !== a.score) return b.score - a.score;
        
        // Secondary sort by average score (for tiebreakers)
        const aAvg = (a as Score & { _avgScore: number })._avgScore || 0;
        const bAvg = (b as Score & { _avgScore: number })._avgScore || 0;
        return bAvg - aAvg;
      });
  }, [leaderboard]);
  
  // Find user's rank
  const userRank = userId ? processedLeaderboard.findIndex(score => score.userId === userId) + 1 : 0;
  
  // Get display name for a user
  const getDisplayName = (score: Score) => {
    if (score.userId === userId) {
      return t('you');
    }
    
    if (score.username) {
      return score.username;
    }
    
    return `${t('player')} ${score.userId.substring(0, 6)}`;
  };
  
  return (
    <Card className="overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-transparent">
        <motion.div 
          className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Trophy className="h-5 w-5 text-primary" />
              {t('leaderboard')}
            </CardTitle>
            <CardDescription>{t('topPlayers')}</CardDescription>
          </div>
          {userRank > 0 && (
            <Badge 
              variant="outline" 
              className="px-3 py-1.5 flex items-center gap-1.5 animate-in slide-in-from-right duration-300 self-start text-sm"
            >
              <Star className="h-4 w-4 text-amber-500" />
              {t('yourRanking')}: #{userRank}
            </Badge>
          )}
        </motion.div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        {processedLeaderboard.length > 0 ? (
          <motion.div 
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Top 3 podium - Hide on very small screens */}
            <div className="hidden sm:flex justify-center items-end h-36 mb-8 mt-4">
              {processedLeaderboard.length > 1 && (
                <motion.div 
                  className="flex flex-col items-center mx-3"
                  variants={podiumAnimation}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden mb-2 relative shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <Medal className="h-7 w-7 text-gray-500" />
                  </div>
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-t-md flex items-center justify-center shadow-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="text-center">
                      <p className="font-bold text-2xl">{processedLeaderboard[1].score}</p>
                      <p className="text-xs text-muted-foreground">
                        {processedLeaderboard[1].userId === userId ? (
                          <span className="text-primary font-medium">{t('you')}</span>
                        ) : (
                          getDisplayName(processedLeaderboard[1])
                        )}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                          {processedLeaderboard[1].wordsCorrect.length}
                        </span>
                        <span className="flex items-center">
                          <X className="h-3 w-3 text-red-500 mr-1" />
                          {processedLeaderboard[1].wordsIncorrect.length}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {processedLeaderboard.length > 0 && (
                <motion.div 
                  className="flex flex-col items-center mx-3 -mt-8"
                  variants={podiumAnimation}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center overflow-hidden mb-2 relative shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <Crown className="h-9 w-9 text-amber-600 dark:text-amber-400" />
                  </div>
                  <motion.div 
                    className="w-28 h-32 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-t-md flex items-center justify-center shadow-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="text-center">
                      <p className="font-bold text-3xl">{processedLeaderboard[0].score}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDisplayName(processedLeaderboard[0])}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                        <span className="flex items-center bg-white/40 dark:bg-white/10 px-1.5 py-0.5 rounded">
                          <Check className="h-3 w-3 text-green-600 mr-1" />
                          {processedLeaderboard[0].wordsCorrect.length}
                        </span>
                        <span className="flex items-center bg-white/40 dark:bg-white/10 px-1.5 py-0.5 rounded">
                          <X className="h-3 w-3 text-red-600 mr-1" />
                          {processedLeaderboard[0].wordsIncorrect.length}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {processedLeaderboard.length > 2 && (
                <motion.div 
                  className="flex flex-col items-center mx-3"
                  variants={podiumAnimation}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 border-2 border-orange-300 dark:border-orange-700 flex items-center justify-center overflow-hidden mb-2 relative shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <motion.div 
                    className="w-20 h-18 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-t-md flex items-center justify-center shadow-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="text-center">
                      <p className="font-bold text-xl">{processedLeaderboard[2].score}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDisplayName(processedLeaderboard[2])}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Check className="h-3 w-3 text-green-500 mr-1" />
                          {processedLeaderboard[2].wordsCorrect.length}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
            
            {/* Top 3 mobile view - Only show on small screens */}
            <div className="sm:hidden space-y-3 mt-3 mb-5">
              {processedLeaderboard.slice(0, 3).map((score, index) => (
                <motion.div 
                  key={`mobile-top-${score.id}`}
                  variants={item}
                  className={cn(
                    "flex items-center p-3.5 rounded-lg transition-all duration-200",
                    score.userId === userId ? 
                      "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm" : 
                      "hover:bg-muted/10 border border-border/50",
                    index === 0 ? "bg-gradient-to-r from-amber-100/50 to-transparent dark:from-amber-900/20 dark:to-transparent" : ""
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-3.5 text-xs font-medium shadow-md",
                    index === 0 ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-400 border-2 border-amber-300 dark:border-amber-700" :
                    index === 1 ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 dark:from-gray-800 dark:to-gray-700 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600" :
                    index === 2 ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 dark:from-orange-900/40 dark:to-orange-800/40 dark:text-orange-400 border-2 border-orange-300 dark:border-orange-700" :
                    "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                  )}>
                    {index === 0 ? <Crown className="h-6 w-6" /> : 
                     index === 1 ? <Medal className="h-6 w-6" /> : 
                     index === 2 ? <Award className="h-6 w-6" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="font-medium text-base">
                        {getDisplayName(score)}
                      </span>
                      {score.userId === userId && (
                        <Badge variant="outline" className="ml-1 text-xs px-1.5 py-0 h-4">
                          <Star className="h-3 w-3 text-amber-500 mr-0.5" />
                          {t('you')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span className="mr-3 flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" />
                        {score.wordsCorrect.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <X className="h-3 w-3 text-red-500" />
                        {score.wordsIncorrect.length}
                      </span>
                      {score.createdAt && (
                        <span className="ml-3 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(new Date(score.createdAt)).split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl">{score.score}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 text-right">
                      {t('points')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Other rankings */}
            <motion.div variants={item}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-sm flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  {t('topPlayers')}
                </h3>
                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                  {processedLeaderboard.length} {t('players')}
                </Badge>
              </div>
              
              <Accordion type="multiple" className="space-y-2.5">
                {processedLeaderboard.map((score, index) => (
                  <AccordionItem 
                    key={score.id}
                    value={score.id}
                    className={cn(
                      "border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all",
                      score.userId === userId ? 
                        "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20" : 
                        "hover:bg-accent/50",
                      index < 3 ? "hidden sm:block" : "block"
                    )}
                  >
                    <motion.div
                      variants={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <AccordionTrigger className="px-3 py-3.5 hover:no-underline transition-colors">
                        <div className="flex flex-1 items-center">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center mr-3.5 text-xs font-medium shadow-sm",
                            index === 0 ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-400" :
                            index === 1 ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 dark:from-gray-800 dark:to-gray-700 dark:text-gray-400" :
                            index === 2 ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 dark:from-orange-900/40 dark:to-orange-800/40 dark:text-orange-400" :
                            "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                          )}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium text-sm">{getDisplayName(score)}</span>
                                  {score.userId === userId && (
                                    <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0 h-4">
                                      <Star className="h-3 w-3 text-amber-500 mr-0.5" />
                                      {t('you')}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                  <span className="mr-2 flex items-center gap-1">
                                    <Check className="h-3 w-3 text-green-500" />
                                    {score.wordsCorrect.length}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <X className="h-3 w-3 text-red-500" />
                                    {score.wordsIncorrect.length}
                                  </span>
                                  {score.createdAt && (
                                    <span className="ml-2 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(new Date(score.createdAt)).split(' ')[0]}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right mr-2">
                                <p className="font-bold text-xl">{score.score}</p>
                                <p className="text-xs text-muted-foreground">
                                  {t('points')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3 pt-1">
                        <div className="grid grid-cols-1 gap-3 mt-2">
                          <div className="bg-green-50 dark:bg-green-900/20 p-3.5 rounded-lg">
                            <h4 className="text-xs font-medium flex items-center mb-2.5 text-green-700 dark:text-green-300">
                              <Check className="h-3.5 w-3.5 mr-1.5" />
                              {t('correct')} ({score.wordsCorrect.length})
                            </h4>
                            {score.wordsCorrect.length > 0 ? (
                              <div className="grid grid-cols-2 gap-1.5">
                                {score.wordsCorrect.slice(0, 6).map((word, i) => (
                                  <div key={i} className="text-xs bg-white dark:bg-green-800/30 px-2.5 py-1.5 rounded border border-green-200 dark:border-green-800 flex items-center">
                                    <Check className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0" />
                                    <span className="truncate">{word}</span>
                                  </div>
                                ))}
                                {score.wordsCorrect.length > 6 && (
                                  <div className="text-xs text-green-600 dark:text-green-300 mt-1 pl-1.5 col-span-2">
                                    +{score.wordsCorrect.length - 6} {t('vocabMore')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">{t('noCorrectWords')}</p>
                            )}
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3.5 rounded-lg">
                            <h4 className="text-xs font-medium flex items-center mb-2.5 text-red-700 dark:text-red-300">
                              <X className="h-3.5 w-3.5 mr-1.5" />
                              {t('incorrect')} ({score.wordsIncorrect.length})
                            </h4>
                            {score.wordsIncorrect.length > 0 ? (
                              <div className="grid grid-cols-2 gap-1.5">
                                {score.wordsIncorrect.slice(0, 6).map((word, i) => (
                                  <div key={i} className="text-xs bg-white dark:bg-red-800/30 px-2.5 py-1.5 rounded border border-red-200 dark:border-red-800 flex items-center">
                                    <X className="h-3 w-3 text-red-500 mr-1.5 flex-shrink-0" />
                                    <span className="truncate">{word}</span>
                                  </div>
                                ))}
                                {score.wordsIncorrect.length > 6 && (
                                  <div className="text-xs text-red-600 dark:text-red-300 mt-1 pl-1.5 col-span-2">
                                    +{score.wordsIncorrect.length - 6} {t('vocabMore')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">{t('noIncorrectWords')}</p>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </motion.div>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-8 sm:py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Trophy className="h-14 sm:h-20 w-14 sm:w-20 text-muted-foreground/40 mx-auto mb-5 sm:mb-6" />
            <p className="text-lg sm:text-xl text-muted-foreground mb-3 font-medium">
              {t('noQuizzesYet')}
            </p>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto px-4">{t('noQuizzesDesc')}</p>
            <Button 
              onClick={navigateToGameTab}
              variant="default"
              size="lg"
              className="gap-2.5 group"
            >
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              {t('startQuiz')}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}