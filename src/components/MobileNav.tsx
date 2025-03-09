"use client";

import { Home, BookOpen, History, User, Menu, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { useState, useEffect, useCallback } from "react";

const MobileNav = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide navigation when scrolling down, show when scrolling up
  const controlNavbar = useCallback(() => {
    if (typeof window !== "undefined") {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        // Scrolling down & past threshold
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    }
  }, [lastScrollY]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [controlNavbar]);

  // Don't show for non-authenticated users
  if (!user) return null;

  // Check if current path is one of our main navigation items
  const isMainPath = ['/dashboard', '/quiz', '/history', '/firebase-dashboard'].includes(pathname);

  return (
    <div
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50 transition-transform duration-300 px-2 py-1 shadow-lg",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex justify-around items-center">
        <NavItem
          href="/dashboard"
          icon={<Home className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="Home"
          isActive={pathname === "/dashboard"}
        />
        <NavItem
          href="/quiz"
          icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="Quiz"
          isActive={pathname === "/quiz"}
        />
        
        {/* Create Quiz Button (Center) */}
        <NavItem
          href="/quiz"
          icon={
            <div className="bg-primary text-primary-foreground rounded-full p-2 -mt-6 shadow-md border-4 border-white dark:border-gray-950">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          }
          label="Create"
          isActive={false}
          className="relative -mt-2"
        />
        
        <NavItem
          href="/history"
          icon={<History className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="History"
          isActive={pathname === "/history"}
        />
        <NavItem
          href="/firebase-dashboard"
          icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
          label="Profile"
          isActive={pathname === "/firebase-dashboard"}
        />
      </div>
    </div>
  );
};

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  className?: string;
}

const NavItem = ({ href, icon, label, isActive, className }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center py-1 px-2 sm:py-2 sm:px-3 rounded-lg transition-colors",
        isActive
          ? "text-primary"
          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        className
      )}
    >
      {icon}
      <span className="text-[10px] sm:text-xs mt-1">{label}</span>
    </Link>
  );
};

export default MobileNav; 