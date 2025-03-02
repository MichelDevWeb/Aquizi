import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WordCloud from "../WordCloud";
import { getDocuments } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS } from "@/lib/firestore/firestore-config";
import { orderBy, limit } from "firebase/firestore";

// Define Firestore types
interface TopicCount {
  id: string;
  topic: string;
  count: number;
}

type Props = {};

const HotTopicsCard = async (props: Props) => {
  // Get topics from Firestore
  const topics = await getDocuments<TopicCount>(
    COLLECTIONS.TOPIC_COUNTS,
    [orderBy("count", "desc"), limit(15)]
  );

  const formattedTopics = topics.map((topic) => {
    return {
      text: topic.topic,
      value: topic.count,
    };
  });
  
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Hot Topics</CardTitle>
        <CardDescription>
          Click on a topic to start a quiz on it.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <WordCloud formattedTopics={formattedTopics} />
      </CardContent>
    </Card>
  );
};

export default HotTopicsCard;
