"use client";

import * as Progress from "@radix-ui/react-progress";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <Progress.Root
        className="relative overflow-hidden bg-gray-300 rounded-full w-[300px] h-[25px]"
        style={{
          transform: "translateZ(0)",
        }}
        value={progress}
      >
        <Progress.Indicator
          className="bg-blue-500 w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
          style={{ transform: `translateX(-${100 - progress}%)` }}
        />
      </Progress.Root>
    </div>
  );
};

export default LoadingSpinner;
