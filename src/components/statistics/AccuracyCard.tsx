import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = { accuracy: number };

const AccuracyCard = ({ accuracy }: Props) => {
  const { t } = useLanguage();
  accuracy = Math.round(accuracy * 100) / 100;
  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-4 md:p-6 space-y-0">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">{t('accuracy')}</CardTitle>
        <Target className="h-4 w-4 sm:h-5 sm:w-5" />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
        <div className="text-lg sm:text-xl md:text-2xl font-medium">{accuracy.toString() + "%"}</div>
      </CardContent>
    </Card>
  );
};

export default AccuracyCard;
