'use client';

import getUserMetrics from "@/app/actions/getUserMetrics";
import getHeatMapData from "@/app/actions/getHeatMapData";
import MetricCard from "./MetricCard";
import { useRouter } from "next/navigation";
import DetailsDialog from "@/components/dashboard/DetailsDialog";
import HistoryCard from "@/components/dashboard/HistoryCard";
import QuizMeCard from "@/components/dashboard/QuizMeCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Calendar, LayoutDashboard, TrendingUp, Award, Send, ListChecks, Zap, BookOpen, Trophy, Brain, Star, Medal, BarChart3, Crown, CheckCircle2, X, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import GitHubStyleHeatMap from "./GitHubStyleHeatMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Interface for vocabulary score data
interface VocabularyScore {
  id: string;
  userId: string;
  username?: string;
  score: number;
  wordsCorrect: string[];
  wordsIncorrect: string[];
  createdAt: Date | null;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any[] | null>(null);
  const [heatMapData, setHeatMapData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useLanguage();
  
  // Vocabulary game state
  const [vocabularyScores, setVocabularyScores] = useState<VocabularyScore[]>([]);
  const [vocabularyLeaderboard, setVocabularyLeaderboard] = useState<VocabularyScore[]>([]);
  const [vocabularyLoading, setVocabularyLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const metrics = await getUserMetrics(user.uid);
          const heatMap = await getHeatMapData(user.uid);
          setUserData(metrics || []);
          setHeatMapData(heatMap);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);
  
  // Fetch vocabulary game data
  useEffect(() => {
    const fetchVocabularyData = async () => {
      if (user) {
        try {
          setVocabularyLoading(true);
          
          // Fetch user's vocabulary scores
          const scoresResponse = await fetch(`/api/vocabulary/score?userId=${user.uid}`);
          const scoresData = await scoresResponse.json();
          
          // Fetch vocabulary leaderboard
          const leaderboardResponse = await fetch("/api/vocabulary/score?leaderboard=true");
          const leaderboardData = await leaderboardResponse.json();
          
          if (scoresData.scores) {
            setVocabularyScores(scoresData.scores);
          }
          
          if (leaderboardData.scores) {
            setVocabularyLeaderboard(leaderboardData.scores);
          }
        } catch (error) {
          console.error('Error fetching vocabulary data:', error);
        } finally {
          setVocabularyLoading(false);
        }
      }
    };
    
    if (user) {
      fetchVocabularyData();
    }
  }, [user]);

  if (loading) {
    return (
      <PageLayout contentWidth="wide" mobilePadding="small" mobileStack={true} className="pb-20 md:pb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 sm:h-28 md:h-32 w-full" />
            ))}
          </div>
          
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Prepare metric icons using translation keys
  const metricIcons = {
    "quizzesLabel": <Calendar className="h-5 w-5 text-blue-500" />,
    "recentSubmissionsLabel": <Send className="h-5 w-5 text-green-500" />,
    "averageScoreLabel": <Award className="h-5 w-5 text-yellow-500" />,
    "avgQuestionsPerQuizLabel": <ListChecks className="h-5 w-5 text-purple-500" />
  };
  
  // Calculate vocabulary metrics
  const totalVocabularyGames = vocabularyScores.length;
  const totalWordsLearned = vocabularyScores.reduce((sum, score) => sum + score.wordsCorrect.length, 0);
  const bestScore = vocabularyScores.length > 0 ? Math.max(...vocabularyScores.map(s => s.score)) : 0;
  const averageAccuracy = vocabularyScores.length > 0 
    ? Math.round((vocabularyScores.reduce((sum, s) => sum + s.wordsCorrect.length, 0) / 
      (vocabularyScores.reduce((sum, s) => sum + s.wordsCorrect.length + s.wordsIncorrect.length, 0) || 1)) * 100)
    : 0;
  
  // Find user's rank in leaderboard
  const userRank = user ? vocabularyLeaderboard.findIndex(score => score.userId === user.uid) + 1 : 0;
  
  // Format date to dd/MM/yyyy
  const formatDate = (date: Date | null): string => {
    if (!date) return "Unknown date";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Get display name for a user
  const getDisplayName = (score: VocabularyScore): string => {
    if (score.userId === user?.uid) {
      return t('you');
    }
    
    if (score.username) {
      return score.username;
    }
    
    return `${t('player')} ${score.userId.substring(0, 6)}`;
  };

  return (
    <PageLayout contentWidth="wide" mobilePadding="small" mobileStack={true} className="pb-20 md:pb-0">
      <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">{t('dashboard')}</h1>
        <DetailsDialog />
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-3 sm:mb-4 md:mb-6 w-full justify-start overflow-x-auto flex-nowrap px-0.5">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">{t('overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="quick-actions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">{t('quickActions')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {userData && userData?.length > 0 ? (
                <>
                  {userData?.map((metric) => (
                    <MetricCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      icon={metricIcons[metric.label as keyof typeof metricIcons]}
                    />
                  ))}
                </>
              ) : (
                <div className="col-span-2 md:col-span-4 flex flex-col sm:flex-row items-center justify-center p-2 sm:p-3 md:p-4 border rounded-lg bg-muted/50 text-center sm:text-left">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-0 sm:mr-2 text-muted-foreground" />
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground">{t('noMetricsYet')}</p>
                </div>
              )}
            </div>
            
            {/* Vocabulary Overview Section */}
            <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Vocabulary Overview</span>
                  </CardTitle>
                  {userRank > 0 && (
                    <Badge variant="outline" className="px-2 py-1 flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      {t('yourRanking')}: #{userRank}
                    </Badge>
                  )}
                </div>
                <CardDescription>Your vocabulary learning progress</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {vocabularyLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Vocabulary Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{t('totalGames')}</p>
                          <p className="text-xl font-bold">{totalVocabularyGames}</p>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{t('wordsLearned')}</p>
                          <p className="text-xl font-bold">{totalWordsLearned}</p>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{"Best Score"}</p>
                          <p className="text-xl font-bold">{bestScore}</p>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                          <Star className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{t('accuracy')}</p>
                          <div className="flex items-center justify-end gap-1">
                            <p className="text-xl font-bold">{averageAccuracy}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Scores and Top Leaderboard Section */}
                    {vocabularyScores.length > 0 || vocabularyLeaderboard.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Recent Activity - Compact */}
                        {vocabularyScores.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-blue-500" />
                              {t('recentGames')}
                            </h3>
                            <div className="space-y-1.5">
                              {vocabularyScores.slice(0, 2).map((score, index) => {
                                const correctPercentage = Math.round(
                                  (score.wordsCorrect.length / (score.wordsCorrect.length + score.wordsIncorrect.length)) * 100
                                );
                                
                                return (
                                  <div key={score.id} className="flex items-center justify-between p-2 bg-muted/10 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                        index === 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" :
                                        "bg-primary/10 text-primary"
                                      }`}>
                                        {index === 0 ? <Star className="h-3 w-3" /> : index + 1}
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium">{score.score} {t('points')}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {score.createdAt ? formatDate(new Date(score.createdAt)) : t('dateCompleted')}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-xs font-medium">{correctPercentage}% {t('accuracy')}</div>
                                  </div>
                                );
                              })}
                            </div>
                            <Button asChild variant="link" size="sm" className="mt-1 h-7 p-0">
                              <Link href="/vocabulary?tab=scores">
                                <span>View all scores</span>
                                <ArrowRight className="ml-1 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        )}
                        
                        {/* Leaderboard - Compact */}
                        {vocabularyLeaderboard.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                              <Trophy className="h-3.5 w-3.5 text-amber-500" />
                              {t('leaderboard')}
                            </h3>
                            <div className="space-y-1.5">
                              {vocabularyLeaderboard.slice(0, 3).map((score, index) => (
                                <div 
                                  key={score.id} 
                                  className={`flex items-center justify-between p-2 ${
                                    score.userId === user?.uid ? "bg-primary/5" : "bg-muted/10"
                                  } rounded-md`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                      index === 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" :
                                      index === 1 ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                                      index === 2 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" :
                                      "bg-primary/10 text-primary"
                                    }`}>
                                      {index === 0 ? <Crown className="h-3 w-3" /> : index + 1}
                                    </div>
                                    <p className="text-xs font-medium">
                                      {getDisplayName(score)}
                                      {score.userId === user?.uid && (
                                        <span className="ml-1 text-primary">(You)</span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-xs font-medium">{score.score} {t('points')}</div>
                                </div>
                              ))}
                            </div>
                            <Button asChild variant="link" size="sm" className="mt-1 h-7 p-0">
                              <Link href="/vocabulary?tab=leaderboard">
                                <span>View full leaderboard</span>
                                <ArrowRight className="ml-1 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <BookOpen className="h-8 w-8 mb-2 text-muted-foreground/40" />
                        <h3 className="text-base font-semibold mb-1">No vocabulary practice yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Start practicing to track your progress</p>
                      </div>
                    )}
                    
                    {/* Practice buttons */}
                    <div className="flex flex-wrap gap-2 sm:mt-2">
                      <Button asChild size="sm">
                        <Link href="/vocabulary">
                          <Zap className="mr-1.5 h-3.5 w-3.5" />
                          Start Practice
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/vocabulary?mode=challenge">
                          <Star className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                          Daily Challenge
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="overflow-x-auto pb-1 sm:pb-2 -mx-3 sm:mx-0 px-3 sm:px-0">
              {heatMapData ? (
                <GitHubStyleHeatMap data={heatMapData.data} />
              ) : (
                <Card className="border rounded-lg bg-card shadow-sm">
                  <CardHeader className="pb-1 sm:pb-2 md:pb-3 p-2 sm:p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-sm sm:text-base md:text-lg font-medium flex items-center gap-1 sm:gap-2">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                          {t('contributionActivityTitle')}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {new Date().getFullYear()} · 0 {t('contributionCount')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center py-3 sm:py-4 md:py-6 text-center p-2 sm:p-3 md:p-4">
                    <div className="flex flex-col items-center px-2 sm:px-4">
                      <Info className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mb-2 sm:mb-3 text-muted-foreground" />
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2">{t('noActivity')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                        {t('takeQuizzesForActivity')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <RecentActivityCard />
          </div>
        </TabsContent>
        
        <TabsContent value="quick-actions" className="space-y-3 sm:space-y-4 md:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <QuizMeCard />
            <HistoryCard />
          </div>
          
          {/* Vocabulary Practice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <Card className="overflow-hidden border hover:border-primary/50 transition-all group">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {"Vocabulary Practice"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  {"Practice your vocabulary with interactive exercises"}
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/vocabulary">
                    <Zap className="mr-2 h-3.5 w-3.5" />
                    {"Start Practice"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border hover:border-primary/50 transition-all group">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  {"Daily Challenge"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  {"Complete today's vocabulary challenge to earn bonus points"}
                </p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/vocabulary?mode=challenge">
                    <Star className="mr-2 h-3.5 w-3.5 text-amber-500" />
                    {"Start Challenge"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border hover:border-primary/50 transition-all group">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  {t('leaderboard') || "Leaderboard"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  {"See how you rank against other players"}
                </p>
                <Button asChild size="sm" variant="secondary" className="w-full">
                  <Link href="/vocabulary?tab=leaderboard">
                    <Medal className="mr-2 h-3.5 w-3.5" />
                    {"View Leaderboard"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default DashboardPage;
