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
import { Info, Calendar, LayoutDashboard, TrendingUp, Award, Send, ListChecks, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import GitHubStyleHeatMap from "./GitHubStyleHeatMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/PageLayout";
import { getBaseUrl } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any[] | null>(null);
  const [heatMapData, setHeatMapData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useLanguage();

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
      </Tabs>
    </PageLayout>
  );
};

export default DashboardPage;
