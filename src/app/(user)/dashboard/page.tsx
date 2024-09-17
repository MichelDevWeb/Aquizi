import { auth } from "@/auth";
import getUserMetrics from "@/actions/getUserMetrics";
import getHeatMapData from "@/actions/getHeatMapData";
import MetricCard from "./MetricCard";
import SubmissionsHeatMap from "./HeatMap";
import { redirect } from "next/navigation";
import DetailsDialog from "@/components/dashboard/DetailsDialog";
import HistoryCard from "@/components/dashboard/HistoryCard";
import HotTopicsCard from "@/components/dashboard/HotTopicsCard";
import QuizMeCard from "@/components/dashboard/QuizMeCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";

const page = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  const userId = session?.user?.id;

  if (!userId) {
    return <p>User not found</p>;
  }
  const userData = await getUserMetrics();
  const heatMapData = await getHeatMapData();

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
        <HistoryCard />
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        <HotTopicsCard />
        <RecentActivityCard />
      </div>
    </main>
  );
};

export default page;
