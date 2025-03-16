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
import { Info, Calendar, LayoutDashboard, TrendingUp, Award, Send, ListChecks, Zap, BookOpen, Trophy, Brain, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import GitHubStyleHeatMap from "./GitHubStyleHeatMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/PageLayout";
import { getBaseUrl } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Interface for vocabulary score data
interface VocabularyScore {
  id: string;
  userId: string;
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
  
  // Format date to dd/MM/yyyy
  const formatDate = (date: Date | null): string => {
    if (!date) return "Unknown date";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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
          <TabsTrigger value="vocabulary" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1.5 px-2 sm:px-3">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">Vocabulary</span>
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
        </TabsContent>
        
        <TabsContent value="vocabulary" className="space-y-3 sm:space-y-4 md:space-y-5">
          {/* Vocabulary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <MetricCard
              label="Total Games"
              value={totalVocabularyGames}
              icon={<BookOpen className="h-5 w-5 text-blue-500" />}
            />
            <MetricCard
              label="Words Learned"
              value={totalWordsLearned}
              icon={<Brain className="h-5 w-5 text-green-500" />}
            />
            <MetricCard
              label="Best Score"
              value={bestScore}
              icon={<Trophy className="h-5 w-5 text-yellow-500" />}
            />
            <MetricCard
              label="Accuracy"
              value={`${averageAccuracy}%`}
              icon={<Star className="h-5 w-5 text-purple-500" />}
            />
          </div>
          
          {/* Vocabulary Leaderboard */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>Vocabulary Leaderboard</span>
              </CardTitle>
              <CardDescription>Top scores from all players</CardDescription>
            </CardHeader>
            <CardContent>
              {vocabularyLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : vocabularyLeaderboard.length > 0 ? (
                <div className="space-y-2">
                  {vocabularyLeaderboard.slice(0, 5).map((score, index) => (
                    <div 
                      key={score.id} 
                      className={`flex items-center p-2 rounded-md ${
                        score.userId === user?.uid ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/10"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-medium ${
                        index === 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" :
                        index === 1 ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                        index === 2 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="font-medium text-sm">
                            {score.userId === user?.uid ? "You" : `Player ${score.userId.substring(0, 6)}`}
                          </p>
                          {score.userId === user?.uid && (
                            <Badge variant="outline" className="ml-2 text-xs px-1 py-0 h-4">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="mr-2">{score.wordsCorrect.length} correct</span>
                          <span>{score.wordsIncorrect.length} incorrect</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{score.score}</p>
                        <p className="text-xs text-muted-foreground">
                          {score.createdAt ? formatDate(new Date(score.createdAt)) : "Unknown date"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Info className="h-8 w-8 mb-2 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-1">No leaderboard data yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Be the first to play and set a high score!</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/vocabulary">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Practice Vocabulary
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Recent Vocabulary Games */}
          {vocabularyScores.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Your Recent Games</span>
                </CardTitle>
                <CardDescription>Your vocabulary practice history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vocabularyScores.slice(0, 3).map((score, index) => (
                    <div key={score.id} className="border rounded-lg p-3 hover:bg-muted/10 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <h3 className="font-medium">{score.score} points</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {score.createdAt ? formatDate(new Date(score.createdAt)) : "Unknown date"}
                        </p>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Accuracy</span>
                          <span>
                            {Math.round((score.wordsCorrect.length / (score.wordsCorrect.length + score.wordsIncorrect.length)) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.round((score.wordsCorrect.length / (score.wordsCorrect.length + score.wordsIncorrect.length)) * 100)} 
                          className="h-1" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/vocabulary">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View All Games
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default DashboardPage;
