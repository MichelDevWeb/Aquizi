'use client';

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WordCloud from "../WordCloud";
import { useLanguage } from "@/contexts/LanguageContext";

interface HotTopicsCardWrapperProps {
  formattedTopics: Array<{ text: string; value: number }>;
}

const HotTopicsCardWrapper = ({ formattedTopics }: HotTopicsCardWrapperProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t('hotTopics')}</CardTitle>
        <CardDescription>
          {t('clickTopicToStart')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <WordCloud formattedTopics={formattedTopics} />
      </CardContent>
    </Card>
  );
};

export default HotTopicsCardWrapper; 