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
import { Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import GitHubStyleHeatMap from "./GitHubStyleHeatMap";

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any[]>([]);
  const [heatMapData, setHeatMapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      <main className="p-4 sm:p-8 mx-auto max-w-7xl">
        <div className="flex items-center">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
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

  return (
    <main className="p-4 sm:p-8 mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
        <DetailsDialog />
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {userData && userData?.length > 0 ? (
            <>
              {userData?.map((metric) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                />
              ))}
            </>
          ) : (
            <div className="col-span-2 md:col-span-4 flex items-center justify-center p-6 border rounded-lg bg-muted/50">
              <Info className="h-5 w-5 mr-2 text-muted-foreground" />
              <p className="text-muted-foreground">No metrics available yet. Take some quizzes to see your stats!</p>
            </div>
          )}
        </div>
        <div className="mb-8">
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
      </div>

      <div className="grid gap-4 mt-4 grid-cols-1 md:grid-cols-2">
        <QuizMeCard />
        <HistoryCard />
      </div>
      <div className="grid gap-4 mt-4">
        <RecentActivityCard />
      </div>
    </main>
  );
};

export default DashboardPage;
