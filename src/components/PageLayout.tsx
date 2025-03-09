"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  contentWidth?: "narrow" | "medium" | "wide" | "full" | "custom";
  customWidth?: string;
  centered?: boolean;
  mobilePadding?: "none" | "small" | "medium" | "large";
  mobileStack?: boolean;
  safePaddingBottom?: boolean;
}

/**
 * PageLayout component that ensures consistent page structure and footer positioning
 * @param children - The page content
 * @param className - Additional CSS classes for the main content area
 * @param fullHeight - Whether the page should take up the full viewport height
 * @param contentWidth - Predefined width options for the content
 * @param customWidth - Custom width value (used when contentWidth is "custom")
 * @param centered - Whether to center the content horizontally
 * @param mobilePadding - Amount of padding on mobile devices
 * @param mobileStack - Whether to stack content vertically on mobile
 * @param safePaddingBottom - Whether to add safe area padding at the bottom for mobile devices
 */
const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  className = "", 
  fullHeight = true,
  contentWidth = "medium",
  customWidth,
  centered = true,
  mobilePadding = "medium",
  mobileStack = false,
  safePaddingBottom = false
}) => {
  // Define width classes based on contentWidth
  const widthClasses = {
    narrow: "max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl",
    medium: "max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-5xl",
    wide: "max-w-2xl sm:max-w-3xl md:max-w-5xl lg:max-w-7xl",
    full: "w-full",
    custom: customWidth || "max-w-5xl"
  };

  // Define mobile padding classes
  const mobilePaddingClasses = {
    none: "px-0",
    small: "px-2 sm:px-3 md:px-4 lg:px-6",
    medium: "px-3 sm:px-4 md:px-6 lg:px-8",
    large: "px-4 sm:px-6 md:px-8 lg:px-10"
  };

  const selectedWidth = widthClasses[contentWidth];
  const selectedPadding = mobilePaddingClasses[mobilePadding];
  
  return (
    <div 
      className={cn(
        "flex flex-col",
        fullHeight && "min-h-[calc(100vh-4rem)]"
      )}
    >
      <main 
        className={cn(
          "flex-1",
          centered && "mx-auto",
          selectedWidth,
          selectedPadding,
          mobileStack && "flex flex-col",
          safePaddingBottom && "pb-safe",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default PageLayout; 