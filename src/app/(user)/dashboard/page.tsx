'use client';

import getUserMetrics from "@/app/actions/getUserMetrics";
import getHeatMapData from "@/app/actions/getHeatMapData";
import MetricCard from "./MetricCard";
import SubmissionsHeatMap from "./HeatMap";
import { useRouter } from "next/navigation";
import DetailsDialog from "@/components/dashboard/DetailsDialog";
import HistoryCard from "@/components/dashboard/HistoryCard";
import HotTopicsCard from "@/components/dashboard/HotTopicsCard";
import QuizMeCard from "@/components/dashboard/QuizMeCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
    const fetchData = () => {
      if (user) {
        try {
          // const metrics = await getUserMetrics(user.uid);
          // const heatMap = await getHeatMapData(user.uid);
          // setUserData(metrics || []);
          // setHeatMapData(heatMap);
          setUserData([]);
          setHeatMapData([]);
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
      <main className="p-8 mx-auto max-w-7xl">
        <div className="flex items-center">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
    <main className="p-8 mx-auto max-w-7xl">
      <div className="flex items-center">
        <h2 className="mr-2 text-3xl font-bold tracking-tight">Dashboard</h2>
        <DetailsDialog />
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          ) : null}
        </div>
        <div>
          {heatMapData ? <SubmissionsHeatMap data={heatMapData.data} /> : null}
        </div>
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <QuizMeCard />
        {/* <HistoryCard /> */}
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        {/* <HotTopicsCard /> */}
        {/* <RecentActivityCard /> */}
      </div>
    </main>
  );
};

export default DashboardPage;
