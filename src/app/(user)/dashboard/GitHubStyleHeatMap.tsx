"use client";
import React, { useMemo } from "react";
import Tooltip from "@uiw/react-tooltip";
import HeatMap from "@uiw/react-heat-map";
import { convertDateToString } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, subYears, getYear } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";

type Props = {
  data: {
    createdAt: Date | string;
    count: number;
  }[];
};

// GitHub-style color scheme
const panelColors = {
  0: "#ebedf0",
  1: "#9be9a8",
  5: "#40c463",
  10: "#30a14e",
  15: "#216e39",
};

const GitHubStyleHeatMap = (props: Props) => {
  // Format dates for the heatmap
  const formattedDates = useMemo(() => {
    return props.data?.map((item) => ({
      date: convertDateToString(item.createdAt),
      count: item.count,
    })) || [];
  }, [props.data]);

  // Calculate date range - exactly one year
  const dates = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1); // January 1st of current year
    const endOfYear = new Date(currentYear, 11, 31); // December 31st of current year
    return { today, startOfYear, endOfYear };
  }, []);

  // Calculate total contributions
  const totalContributions = useMemo(() => {
    return formattedDates.reduce((sum, item) => sum + item.count, 0);
  }, [formattedDates]);

  // Calculate current streak (consecutive days with activity)
  const currentStreak = useMemo(() => {
    if (formattedDates.length === 0) return 0;
    
    // Sort dates in descending order
    const sortedDates = [...formattedDates].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    
    // Format current date to match the format in sortedDates
    const formattedCurrentDate = convertDateToString(currentDate);
    
    // Check if there's activity today
    const todayActivity = sortedDates.find(item => item.date === formattedCurrentDate);
    
    if (!todayActivity || todayActivity.count === 0) {
      // No activity today, check yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Count consecutive days with activity
    while (true) {
      const dateString = convertDateToString(currentDate);
      const dayActivity = sortedDates.find(item => item.date === dateString);
      
      if (dayActivity && dayActivity.count > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }, [formattedDates]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Contribution Activity
            </CardTitle>
            <CardDescription>
              {getYear(dates.startOfYear)} · {totalContributions} total contributions
            </CardDescription>
          </div>
          {currentStreak > 0 && (
            <div className="mt-2 sm:mt-0 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span className="font-medium">{currentStreak} day{currentStreak !== 1 ? 's' : ''} streak</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[640px] md:min-w-full">
            <HeatMap
              value={formattedDates}
              width="100%"
              startDate={dates.startOfYear}
              endDate={dates.endOfYear}
              rectSize={12}
              space={3}
              legendCellSize={0}
              panelColors={panelColors}
              rectProps={{
                rx: 2
              }}
              monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
              rectRender={(props, data) => {
                return (
                  <Tooltip
                    placement="top"
                    content={
                      <div style={{ 
                        padding: '8px 10px', 
                        backgroundColor: '#24292e', 
                        color: '#fff', 
                        borderRadius: '6px',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.16)'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                          {format(new Date(data.date), 'EEEE, MMMM d, yyyy')}
                        </div>
                        <div>
                          {data.count 
                            ? `${data.count} ${data.count === 1 ? 'quiz' : 'quizzes'}`
                            : 'No quizzes'
                          }
                        </div>
                      </div>
                    }
                  >
                    <rect {...props} />
                  </Tooltip>
                );
              }}
            />
          </div>
        </div>
        <div className="flex justify-end items-center mt-3 text-xs text-muted-foreground">
          <span className="mr-1">Less</span>
          {Object.values(panelColors).map((color, i) => (
            <div 
              key={i} 
              className="w-3 h-3 mx-0.5" 
              style={{ backgroundColor: color, borderRadius: '2px' }}
            />
          ))}
          <span className="ml-1">More</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubStyleHeatMap; 