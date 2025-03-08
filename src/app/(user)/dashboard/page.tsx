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
import { Info, Calendar, LayoutDashboard, TrendingUp, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import GitHubStyleHeatMap from "./GitHubStyleHeatMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any[]>([]);
  const [heatMapData, setHeatMapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <main className="p-4 sm:p-6 md:p-8 mx-auto max-w-7xl">
        <div className="flex items-center">
          <Skeleton className="h-8 sm:h-10 w-40" />
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Prepare metric icons
  const metricIcons = {
    "Total Quizzes": <Calendar className="h-5 w-5 text-blue-500" />,
    "Average Score": <Award className="h-5 w-5 text-yellow-500" />,
    "Topics Covered": <LayoutDashboard className="h-5 w-5 text-green-500" />,
    "Highest Score": <TrendingUp className="h-5 w-5 text-purple-500" />
  };

  return (
    <main className="p-4 sm:p-6 md:p-8 mx-auto max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <DetailsDialog />
      </div>

      <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                <div className="col-span-1 sm:col-span-2 md:col-span-4 flex items-center justify-center p-6 border rounded-lg bg-muted/50">
                  <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No metrics available yet. Take some quizzes to see your stats!</p>
                </div>
              )}
            </div>
            
            <div>
              {heatMapData ? (
                <GitHubStyleHeatMap data={heatMapData.data} />
              ) : (
                <Card className="border rounded-lg bg-card">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Contribution Activity
                        </CardTitle>
                        <CardDescription>
                          {new Date().getFullYear()} · 0 total contributions
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center py-10 text-center">
                    <div className="flex flex-col items-center">
                      <Info className="h-10 w-10 mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                      <p className="text-muted-foreground max-w-md">
                        Take some quizzes to see your contribution activity
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <RecentActivityCard />
          </div>
        </TabsContent>
        
        <TabsContent value="activity">
          <div className="space-y-6">
            <div>
              {heatMapData ? (
                <GitHubStyleHeatMap data={heatMapData.data} />
              ) : (
                <Card className="border rounded-lg bg-card">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Contribution Activity
                        </CardTitle>
                        <CardDescription>
                          {new Date().getFullYear()} · 0 total contributions
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center py-10 text-center">
                    <div className="flex flex-col items-center">
                      <Info className="h-10 w-10 mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                      <p className="text-muted-foreground max-w-md">
                        Take some quizzes to see your contribution activity
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <RecentActivityCard />
          </div>
        </TabsContent>
        
        <TabsContent value="actions">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <QuizMeCard />
            <HistoryCard />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default DashboardPage;
