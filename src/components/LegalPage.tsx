"use client";

import React, { ReactNode } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { convertDateToString } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface LegalPageProps {
  title: string;
  children: ReactNode;
  lastUpdated?: string;
}

/**
 * A reusable component for legal pages like Privacy Policy and Terms of Service
 */
export default function LegalPage({ title, children, lastUpdated }: LegalPageProps) {
  // Use provided date or current date
  const formattedDate = lastUpdated || convertDateToString(new Date());
  const { t } = useLanguage();
  
  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">{title}</CardTitle>
            <CardDescription>{t('lastUpdated')}: {formattedDate}</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            {children}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 