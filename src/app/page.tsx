'use client';

import FirebaseSignInButton from "@/components/FirebaseSignInButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state while checking authentication
  if (loading || !isClient) {
    return (
      <PageLayout contentWidth="full" mobilePadding="small" className="flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 sm:h-10 md:h-12 w-36 sm:w-40 md:w-48 bg-gray-200 rounded mb-3 sm:mb-4"></div>
          <div className="h-6 sm:h-7 md:h-8 w-48 sm:w-56 md:w-64 bg-gray-200 rounded"></div>
        </div>
      </PageLayout>
    );
  }

  if (user) {
    return (
      <PageLayout contentWidth="full" mobilePadding="small" className="py-2 sm:py-4 md:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12 w-full">
          <div className="order-2 sm:order-1 w-full max-w-xs sm:max-w-sm">
            <Image
              src="/images/owl-landing-no-bg.png"
              alt="Quiz Hero"
              width={300}
              height={300}
              priority
              className="w-full h-auto max-w-[250px] sm:max-w-[300px] mx-auto"
            />
          </div>
          <div className="order-1 sm:order-2 text-center sm:text-left flex gap-3 sm:gap-4 md:gap-6 flex-col max-w-md w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {t('welcomeToAquizi')}
            </h1>
            <h3 className="text-sm sm:text-base">
              {t('createAndGenerateQuizzes')}
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
              <Button
                variant="neo"
                className="flex-1 h-10 sm:h-12 md:h-14"
                asChild
              >
                <Link href="quiz">{t('createQuiz')}</Link>
              </Button>
              <Button
                variant="neo"
                className="flex-1 h-10 sm:h-12 md:h-14"
                asChild
              >
                <Link href="dashboard">{t('dashboard')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout contentWidth="narrow" mobilePadding="small" className="flex justify-center items-center py-3 sm:py-4 md:py-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('welcomeCardTitle')}</CardTitle>
          <CardDescription>
            {t('welcomeCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FirebaseSignInButton text={t('signInWithGoogle')} />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
