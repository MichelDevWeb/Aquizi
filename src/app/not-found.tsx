"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";

export default function NotFound() {
  const router = useRouter();

  return (
    <PageLayout contentWidth="narrow" mobilePadding="medium" className="py-6 sm:py-10 flex items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you&aposre looking for doesn&apost exist or has been moved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This could be because:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>The URL was mistyped</li>
            <li>The page was removed or renamed</li>
            <li>You re trying to access a dynamic route that requires server-side functionality</li>
          </ul>
          <p>
            Please return to the dashboard or try navigating to another page.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto">
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </PageLayout>
  );
} 