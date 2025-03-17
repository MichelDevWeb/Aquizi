import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Crown, Calendar, Users, Award, ArrowRight, Star, Clock, Check, X } from "lucide-react";
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

// Timeline options
type TimelineOption = "today" | "week" | "month" | "all";

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
  const [timeline, setTimeline] = useState<TimelineOption>("today");
  
  // Filter leaderboard by timeline and get unique best scores by user
  const filteredLeaderboard = useMemo(() => {
    // First filter by timeline
    const now = new Date();
    const filtered = leaderboard.filter(score => {
      if (!score.createdAt) return timeline === "all";
      
      const scoreDate = new Date(score.createdAt);
      
      switch (timeline) {
        case "today":
          return scoreDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return scoreDate >= weekAgo;
        case "month":
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          return scoreDate >= monthAgo;
        case "all":
        default:
          return true;
      }
    });
    
    // Then get the best score for each user
    const userBestScores = new Map<string, Score>();
    
    filtered.forEach(score => {
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
        const existingAvg = (existingScore as Score & { _avgScore: number })._avgScore || 0;
        
        // Replace if this score has a better average
        if (avgScore > existingAvg) {
          userBestScores.set(score.userId, {
            ...score,
            _avgScore: avgScore
          } as Score & { _avgScore: number });
        }
      }
    });
    
    // Convert map to array and sort by score
    return Array.from(userBestScores.values())
      .sort((a, b) => b.score - a.score);
  }, [leaderboard, timeline]);
  
  // Find user's rank
  const userRank = userId ? filteredLeaderboard.findIndex(score => score.userId === userId) + 1 : 0;
  
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
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            {userRank > 0 && (
              <Badge 
                variant="outline" 
                className="px-2 py-1 flex items-center gap-1 animate-in slide-in-from-right duration-300 self-start"
              >
                <Star className="h-3 w-3 text-amber-500" />
                {t('yourRanking')}: #{userRank}
              </Badge>
            )}
            <Select
              value={timeline}
              onValueChange={(value) => setTimeline(value as TimelineOption)}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                <SelectValue placeholder={t('selectTimeline')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{t('today')}</SelectItem>
                <SelectItem value="week">{t('thisWeek')}</SelectItem>
                <SelectItem value="month">{t('thisMonth')}</SelectItem>
                <SelectItem value="all">{t('allTime')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        {filteredLeaderboard.length > 0 ? (
          <motion.div 
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Top 3 podium - Hide on very small screens */}
            <div className="hidden sm:flex justify-center items-end h-32 mb-8 mt-4">
              {filteredLeaderboard.length > 1 && (
                <motion.div 
                  className="flex flex-col items-center mx-2"
                  variants={podiumAnimation}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden mb-2 relative shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <Medal className="h-6 w-6 text-gray-500" />
                  </div>
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-t-md flex items-center justify-center shadow-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="text-center">
                      <p className="font-bold text-lg">{filteredLeaderboard[1].score}</p>
                      <p className="text-xs text-muted-foreground">
                        {filteredLeaderboard[1].userId === userId ? (
                          <span className="text-primary font-medium">{t('you')}</span>
                        ) : (
                          getDisplayName(filteredLeaderboard[1])
                        )}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {filteredLeaderboard.length > 0 && (
                <motion.div 
                  className="flex flex-col items-center mx-2 -mt-8"
                  variants={podiumAnimation}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center overflow-hidden mb-2 relative shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <motion.div 
                    className="w-24 h-28 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-t-md flex items-center justify-center shadow-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="text-center">
                      <p className="font-bold text-xl">{filteredLeaderboard[0].score}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDisplayName(filteredLeaderboard[0])}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center justify-center gap-1">
                        <Check className="h-3 w-3" />
                        {filteredLeaderboard[0].wordsCorrect.length} {t('correct')}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
              
              {filteredLeaderboard.length > 2 && (
                <motion.div 
                  className="flex flex-col items-center mx-2"
                  variants={podiumAnimation}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 border-2 border-orange-300 dark:border-orange-700 flex items-center justify-center overflow-hidden mb-2 relative shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <motion.div 
                    className="w-[50px] h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-t-md flex items-center justify-center shadow-lg"
                    whileHover={{ y: -2 }}
                  >
                    <div className="text-center">
                      <p className="font-bold text-lg">{filteredLeaderboard[2].score}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDisplayName(filteredLeaderboard[2])}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
            
            {/* Top 3 mobile view - Only show on small screens */}
            <div className="sm:hidden space-y-2 mt-2 mb-4">
              {filteredLeaderboard.slice(0, 3).map((score, index) => (
                <motion.div 
                  key={`mobile-top-${score.id}`}
                  variants={item}
                  className={cn(
                    "flex items-center p-2 rounded-lg transition-all duration-200",
                    score.userId === userId ? 
                      "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm" : 
                      "hover:bg-muted/10 border border-border/50",
                    index === 0 ? "bg-gradient-to-r from-amber-100/50 to-transparent dark:from-amber-900/20 dark:to-transparent" : ""
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center mr-3 text-xs font-medium shadow-sm",
                    index === 0 ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-400" :
                    index === 1 ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 dark:from-gray-800 dark:to-gray-700 dark:text-gray-400" :
                    index === 2 ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 dark:from-orange-900/40 dark:to-orange-800/40 dark:text-orange-400" :
                    "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                  )}>
                    {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-sm">
                        {getDisplayName(score)}
                      </span>
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
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{score.score}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {score.createdAt ? formatDate(new Date(score.createdAt)).split(' ')[0] : t('completed')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Other rankings */}
            <motion.div variants={item}>
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm mb-2 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  {t('topPlayers')}
                </h3>
                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                  {filteredLeaderboard.length} {t('players')}
                </Badge>
              </div>
              
              <Accordion type="multiple" className="space-y-2">
                {filteredLeaderboard.map((score, index) => (
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
                      <AccordionTrigger className="px-3 py-2 hover:no-underline transition-colors">
                        <div className="flex flex-1 items-center">
                          <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center mr-3 text-xs font-medium shadow-sm",
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
                                </div>
                              </div>
                              <div className="text-right mr-2">
                                <p className="font-bold">{score.score}</p>
                                <p className="text-xs text-muted-foreground">
                                  {score.createdAt ? formatDate(new Date(score.createdAt)).split(' ')[0] : t('completed')}
                                </p>
                              </div>
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
            <Trophy className="h-12 sm:h-16 w-12 sm:w-16 text-muted-foreground/40 mx-auto mb-4 sm:mb-6" />
            <p className="text-base sm:text-lg text-muted-foreground mb-2 font-medium">
              {timeline === "today" 
                ? t('noQuizzesToday')
                : timeline === "week" 
                  ? t('noQuizzesThisWeek')
                  : timeline === "month" 
                    ? t('noQuizzesThisMonth')
                    : t('noQuizzesYet')}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-sm mx-auto">{t('noQuizzesDesc')}</p>
            <Button 
              onClick={navigateToGameTab}
              variant="outline"
              size="lg"
              className="gap-2 group"
            >
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              {t('startQuiz')}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}