import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy } from "lucide-react";
type Props = { accuracy: number };

const ResultsCard = ({ accuracy }: Props) => {
  return (
    <Card className="md:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">Results</CardTitle>
        <Award className="h-5 w-5" />
      </CardHeader>
      <CardContent className="flex flex-row items-center justify-center py-4">
        {accuracy > 75 ? (
          <>
            <Trophy
              className="mr-4"
              stroke="gold"
              size={50}
            />
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-yellow-400">Impressive!</span>
              <span className="text-sm text-gray-500">
                {"> 75% accuracy"}
              </span>
            </div>
          </>
        ) : accuracy > 25 ? (
          <>
            <Trophy
              className="mr-4"
              stroke="silver"
              size={50}
            />
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-stone-400">Good job!</span>
              <span className="text-sm text-gray-500">
                {"> 25% accuracy"}
              </span>
            </div>
          </>
        ) : (
          <>
            <Trophy
              className="mr-4"
              stroke="brown"
              size={50}
            />
            <div className="flex flex-col">
              <span className="text-2xl font-semibold text-yellow-800">Nice try!</span>
              <span className="text-sm text-gray-500">
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
