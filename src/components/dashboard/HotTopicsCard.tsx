import React from "react";
import { getDocuments } from "@/lib/firestore/firestore-utils";
import { COLLECTIONS } from "@/lib/firestore/firestore-config";
import { orderBy, limit } from "firebase/firestore";
import HotTopicsCardWrapper from "./HotTopicsCardWrapper";

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
  
  // Use the client component wrapper for translations
  return <HotTopicsCardWrapper formattedTopics={formattedTopics} />;
};

export default HotTopicsCard;
