'use client';

import FirebaseSignInButton from "@/components/FirebaseSignInButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state while checking authentication
  if (loading || !isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col flex-1">
        <main className="flex justify-center flex-1">
          <div className="items-center flex flex-col sm:flex-row gap-20 justify-end mx-auto p-10 w-full sm:py-20 sm:w-[1000px]">
            <div>
              <Image
                src="/images/owl-landing-no-bg.png"
                width="400"
                height="400"
                alt="owl"
              />
            </div>
            <div className="text-center flex gap-6 flex-col">
              <h1 className="text-3xl font-bold">
                Welcome to the Aquizi page👋
              </h1>
              <h3 className="text-sm">
                Upload documents, and easily generate your quizzes with AI.
              </h3>
              <div className="flex gap-4">
                <Button
                  variant="neo"
                  className="flex-1 h-14"
                  asChild
                >
                  <Link href="upload-quizz/new">Upload</Link>
                </Button>
                <Button
                  variant="neo"
                  className="flex-1 h-14"
                  asChild
                >
                  <Link href="dashboard">Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="justify-center p-8 mx-auto max-w-7xl">
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Welcome to Aquizi 🔥!</CardTitle>
            <CardDescription>
              Aquizi is a platform for creating quizzes using AI!. Get started
              by logging in below!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FirebaseSignInButton text="Sign In with Google" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
