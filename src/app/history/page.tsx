import HistoryComponent from "@/components/HistoryComponent";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LucideLayoutDashboard } from "lucide-react";

type Props = {};

const History = async (props: Props) => {
  const session = await auth();
  if (!session?.user) {
    return redirect("/");
  }
  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">History</CardTitle>
            <Link
              className={buttonVariants()}
              href="/dashboard"
            >
              <LucideLayoutDashboard className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-scroll">
          <HistoryComponent
            limit={100}
            userId={session.user.id as string}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
