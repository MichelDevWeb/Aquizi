import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hourglass, Clock, Award, BarChart } from "lucide-react";
import { formatTimeDelta } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";

type Props = {
  timeEnded: Timestamp | any;
  timeStarted: Timestamp | null;
  bestTime?: number;
  averageTime?: number;
  lastRetestTime?: number;
  retestCount?: number;
};

const TimeTakenCard = ({ 
  timeEnded, 
  timeStarted, 
  bestTime, 
  averageTime, 
  lastRetestTime,
  retestCount = 0
}: Props) => {
  // Calculate time difference in seconds
  let timeDifferenceInSeconds = 0;
  
  try {
    if (timeEnded && timeStarted) {
      // Make sure both timestamps have toDate method
      if (typeof timeEnded.toDate === 'function' && typeof timeStarted.toDate === 'function') {
        timeDifferenceInSeconds = differenceInSeconds(timeEnded.toDate(), timeStarted.toDate());
      } else {
        console.warn('TimeTakenCard: One or both timestamps do not have toDate method', { timeEnded, timeStarted });
      }
    } else {
      console.warn('TimeTakenCard: Missing timeEnded or timeStarted', { timeEnded, timeStarted });
    }
  } catch (error) {
    console.error('Error calculating time difference:', error);
  }
  
  // Format the time delta for display
  const formattedTime = formatTimeDelta(Math.max(0, timeDifferenceInSeconds));
  
  // Calculate percentage improvement if we have best time and original time
  const hasImprovement = bestTime !== undefined && bestTime < timeDifferenceInSeconds;
  const improvementPercentage = hasImprovement 
    ? Math.round(((timeDifferenceInSeconds - bestTime) / timeDifferenceInSeconds) * 100) 
    : 0;

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4 md:p-6 space-y-0">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">Time Taken</CardTitle>
        <Hourglass className="h-4 w-4 sm:h-5 sm:w-5" />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
        <div className="text-lg sm:text-xl md:text-2xl font-medium">
          {formattedTime || "0s"}
        </div>
        
        {retestCount > 0 && (
          <div className="mt-2 sm:mt-4 space-y-2 sm:space-y-3">
            {bestTime !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-yellow-500" />
                    <span className="text-muted-foreground">Best Time:</span>
                  </div>
                  <span className="font-medium">{formatTimeDelta(bestTime)}</span>
                </div>
                {hasImprovement && (
                  <div className="space-y-1">
                    <Progress value={improvementPercentage} className="h-1.5 sm:h-2" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
                      {improvementPercentage}% improvement
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {averageTime !== undefined && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center">
                  <BarChart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-blue-500" />
                  <span className="text-muted-foreground">Average Time:</span>
                </div>
                <span className="font-medium">{formatTimeDelta(Math.round(averageTime))}</span>
              </div>
            )}
            
            {lastRetestTime !== undefined && lastRetestTime !== timeDifferenceInSeconds && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-500" />
                  <span className="text-muted-foreground">Last Retest:</span>
                </div>
                <span className="font-medium">{formatTimeDelta(lastRetestTime)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeTakenCard;
