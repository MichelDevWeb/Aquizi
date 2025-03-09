import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy } from "lucide-react";
type Props = { accuracy: number };

const ResultsCard = ({ accuracy }: Props) => {
  return (
    <Card className="md:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-4 p-3 sm:p-4 md:p-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">Results</CardTitle>
        <Award className="h-4 w-4 sm:h-5 sm:w-5" />
      </CardHeader>
      <CardContent className="flex flex-row items-center justify-center py-2 sm:py-4 p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
        {accuracy > 75 ? (
          <>
            <Trophy
              className="mr-2 sm:mr-4 sm:w-[40px] sm:h-[40px] w-[30px] h-[30px]"
              stroke="gold"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-yellow-400">Impressive!</span>
              <span className="text-xs sm:text-sm text-gray-500">
                {"> 75% accuracy"}
              </span>
            </div>
          </>
        ) : accuracy > 25 ? (
          <>
            <Trophy
              className="mr-2 sm:mr-4 sm:w-[40px] sm:h-[40px] w-[30px] h-[30px]"
              stroke="silver"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-stone-400">Good job!</span>
              <span className="text-xs sm:text-sm text-gray-500">
                {"> 25% accuracy"}
              </span>
            </div>
          </>
        ) : (
          <>
            <Trophy
              className="mr-2 sm:mr-4 sm:w-[40px] sm:h-[40px] w-[30px] h-[30px]"
              stroke="brown"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-yellow-800">Nice try!</span>
              <span className="text-xs sm:text-sm text-gray-500">
                {"< 25% accuracy"}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsCard;
