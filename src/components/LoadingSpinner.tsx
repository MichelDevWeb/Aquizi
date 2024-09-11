"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Progress } from "./ui/progress";
import Image from "next/image";

const LoadingSpinner = () => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      setProgress(0);
    };
    const handleComplete = () => setLoading(false);

    handleStart();

    return () => {
      handleComplete();
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress >= 90 ? 90 : prevProgress + 10;
          if (newProgress >= 90) {
            setLoading(false);
          }
          return newProgress;
        });
      }, 100);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
    }
  }, [loading]);

  if (!loading && progress === 100) return null;

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="fixed -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-[70vw] md:w-[60vw] flex flex-col items-center">
        <Image
          src={"/images/loading_screen.gif"}
          width={400}
          height={400}
          alt="loading"
        />
        <Progress
          value={progress}
          className="w-full mt-4 bg-black"
        />
        <h1 className="mt-2 text-xl text-black">Loading...</h1>
      </div>
    </div>
  );
};

export default LoadingSpinner;
