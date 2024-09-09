import React from "react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import QuizCreation from "@/components/forms/QuizCreation";

export const metadata = {
  title: "Quiz | Aquizi",
  description: "Quiz yourself on anything!",
};

interface Props {
  searchParams: {
    topic?: string;
  };
}

const Quiz = async ({ searchParams }: Props) => {
  const session: any = await auth();
  if (!session?.user) {
    redirect("/");
  }
  return <QuizCreation topic={searchParams.topic ?? ""} />;
};

export default Quiz;
