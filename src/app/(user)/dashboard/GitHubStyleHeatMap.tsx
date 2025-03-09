"use client";
import React, { useMemo, useEffect, useState } from "react";
import Tooltip from "@uiw/react-tooltip";
import HeatMap from "@uiw/react-heat-map";
import { convertDateToString } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { format, subMonths, getYear, isSameMonth, isSameYear, differenceInDays } from "date-fns";
import { Calendar, TrendingUp, ChevronLeft, ChevronRight, BarChart, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'year' | 'quarter' | 'month'>('quarter');
  const [currentPeriodStart, setCurrentPeriodStart] = useState<Date>(new Date());

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 640;
      setIsMobile(isMobileView);
      
      // Default to month view on very small screens, quarter on medium mobile
      if (isMobileView) {
        if (window.innerWidth < 375 && viewMode === 'quarter') {
          setViewMode('month');
        } else if (window.innerWidth >= 375 && viewMode === 'month') {
          setViewMode('quarter');
        }
      } else if (viewMode !== 'year') {
        setViewMode('year');
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [viewMode]);

  // Format dates for the heatmap
  const formattedDates = useMemo(() => {
    return props.data?.map((item) => ({
      date: convertDateToString(item.createdAt),
      count: item.count,
    })) || [];
  }, [props.data]);

  // Calculate date range based on view mode
  const dates = useMemo(() => {
    const today = new Date();
    
    if (viewMode === 'year') {
      const currentYear = today.getFullYear();
      const startDate = new Date(currentYear, 0, 1); // January 1st of current year
      const endDate = new Date(currentYear, 11, 31); // December 31st of current year
      return { today, startDate, endDate };
    } else if (viewMode === 'quarter') {
      // Quarter view (3 months)
      const startDate = new Date(currentPeriodStart);
      const endDate = new Date(currentPeriodStart);
      endDate.setMonth(endDate.getMonth() + 2); // End date is 3 months from start
      endDate.setDate(endDate.getDate() + 6); // Add a few days to show complete weeks
      return { today, startDate, endDate };
    } else {
      // Month view (1 month)
      const startDate = new Date(currentPeriodStart);
      startDate.setDate(1); // Start from the 1st of the month
      const endDate = new Date(currentPeriodStart);
      endDate.setMonth(endDate.getMonth() + 1); // Go to next month
      endDate.setDate(0); // Last day of current month
      return { today, startDate, endDate };
    }
  }, [viewMode, currentPeriodStart]);

  // Filter data for the current view period
  const filteredData = useMemo(() => {
    return formattedDates.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= dates.startDate && itemDate <= dates.endDate;
    });
  }, [formattedDates, dates]);

  // Calculate total contributions for the current period
  const periodContributions = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.count, 0);
  }, [filteredData]);

  // Calculate total contributions overall
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

  // Calculate activity stats
  const activityStats = useMemo(() => {
    if (formattedDates.length === 0) return { 
      totalDays: 0, 
      activeDays: 0, 
      averagePerDay: 0,
      maxInOneDay: 0
    };
    
    const activeDays = formattedDates.filter(item => item.count > 0).length;
    const maxInOneDay = Math.max(...formattedDates.map(item => item.count));
    
    // Calculate days since first activity
    const dates = formattedDates.map(item => new Date(item.date));
    const firstDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const lastDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const totalDays = differenceInDays(lastDate, firstDate) + 1;
    
    const averagePerDay = totalDays > 0 ? (totalContributions / totalDays).toFixed(1) : 0;
    
    return { totalDays, activeDays, averagePerDay, maxInOneDay };
  }, [formattedDates, totalContributions]);

  // Navigate to previous period
  const goToPreviousPeriod = () => {
    const newDate = new Date(currentPeriodStart);
    if (viewMode === 'year') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else if (viewMode === 'quarter') {
      newDate.setMonth(newDate.getMonth() - 3);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentPeriodStart(newDate);
  };

  // Navigate to next period
  const goToNextPeriod = () => {
    const newDate = new Date(currentPeriodStart);
    if (viewMode === 'year') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    } else if (viewMode === 'quarter') {
      newDate.setMonth(newDate.getMonth() + 3);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    // Don't allow navigating past current date
    const today = new Date();
    if (
      (viewMode === 'year' && newDate.getFullYear() > today.getFullYear()) ||
      (viewMode === 'quarter' && (
        newDate.getFullYear() > today.getFullYear() || 
        (newDate.getFullYear() === today.getFullYear() && newDate.getMonth() > today.getMonth())
      )) ||
      (viewMode === 'month' && (
        newDate.getFullYear() > today.getFullYear() || 
        (newDate.getFullYear() === today.getFullYear() && newDate.getMonth() > today.getMonth())
      ))
    ) {
      setCurrentPeriodStart(today);
    } else {
      setCurrentPeriodStart(newDate);
    }
  };

  // Check if we're at the current period
  const isCurrentPeriod = useMemo(() => {
    const today = new Date();
    if (viewMode === 'year') {
      return currentPeriodStart.getFullYear() === today.getFullYear();
    } else if (viewMode === 'quarter') {
      // Check if any month in the current quarter is the current month
      return [0, 1, 2].some(monthOffset => {
        const periodMonth = new Date(currentPeriodStart);
        periodMonth.setMonth(currentPeriodStart.getMonth() + monthOffset);
        return isSameMonth(periodMonth, today) && isSameYear(periodMonth, today);
      });
    } else {
      return isSameMonth(currentPeriodStart, today) && isSameYear(currentPeriodStart, today);
    }
  }, [viewMode, currentPeriodStart]);

  // Format period title
  const getPeriodTitle = () => {
    if (viewMode === 'year') {
      return getYear(dates.startDate);
    } else if (viewMode === 'quarter') {
      const startMonth = format(dates.startDate, 'MMM');
      const endMonth = format(new Date(dates.startDate.getFullYear(), dates.startDate.getMonth() + 2, 1), 'MMM');
      return `${startMonth} - ${endMonth} ${getYear(dates.startDate)}`;
    } else {
      return format(dates.startDate, 'MMMM yyyy');
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          <div>
            <CardTitle className="text-sm sm:text-base md:text-lg font-medium flex items-center gap-1 sm:gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              Contribution Activity
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm flex items-center justify-between sm:justify-start">
              <span>{getPeriodTitle()}</span>
              <span className="text-xs text-muted-foreground ml-1 sm:ml-2">
                {periodContributions} {viewMode !== 'year' ? `of ${totalContributions}` : ''} contributions
              </span>
            </CardDescription>
          </div>
          {currentStreak > 0 && (
            <div className="mt-1 sm:mt-0 flex items-center text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-500" />
              <span className="font-medium">{currentStreak} day{currentStreak !== 1 ? 's' : ''} streak</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-1 sm:px-3 md:px-4 pt-0 pb-1 sm:pb-2">
        <div className="flex items-center justify-between mb-1 mt-1">
          <Tabs 
            defaultValue={viewMode} 
            className="w-auto"
            onValueChange={(value) => setViewMode(value as 'year' | 'quarter' | 'month')}
          >
            <TabsList className="h-7 p-0.5">
              <TabsTrigger 
                value="month" 
                className={`h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs ${isMobile ? '' : 'hidden'}`}
              >
                Month
              </TabsTrigger>
              <TabsTrigger 
                value="quarter" 
                className="h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs"
              >
                Quarter
              </TabsTrigger>
              <TabsTrigger 
                value="year" 
                className="h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs"
              >
                Year
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={goToPreviousPeriod}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={goToNextPeriod}
              disabled={isCurrentPeriod}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-1 sm:pb-2">
          <HeatMap
            value={formattedDates}
            width="100%"
            startDate={dates.startDate}
            endDate={dates.endDate}
            rectSize={isMobile ? (viewMode === 'month' ? 10 : 8) : 10}
            space={isMobile ? (viewMode === 'month' ? 2 : 1) : 2}
            legendCellSize={0}
            panelColors={panelColors}
            rectProps={{
              rx: isMobile ? (viewMode === 'month' ? 2 : 1) : 2
            }}
            monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
            rectRender={(props, data) => {
              return (
                <Tooltip
                  placement="top"
                  content={
                    <div style={{ 
                      padding: '6px 8px', 
                      backgroundColor: '#24292e', 
                      color: '#fff', 
                      borderRadius: '6px',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
                      fontSize: '12px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
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
        
        <div className="flex justify-between items-center mt-1 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>{activityStats.activeDays} active days</span>
            </div>
            {!isMobile && (
              <div className="flex items-center">
                <BarChart className="h-3 w-3 mr-1" />
                <span>Avg: {activityStats.averagePerDay}/day</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="mr-1">Less</span>
            {Object.values(panelColors).map((color, i) => (
              <div 
                key={i} 
                className="w-2 h-2 sm:w-3 sm:h-3 mx-0.5" 
                style={{ backgroundColor: color, borderRadius: '2px' }}
              />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubStyleHeatMap; 