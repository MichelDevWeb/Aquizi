"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import UserAccountNav from "./UserAccountNav";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { Button } from "./ui/button";

const Navbar = () => {
  const { user, loading } = useAuth();
  const [isUserValid, setIsUserValid] = useState(false);
  
  useEffect(() => {
    // Check if user is valid (authenticated and email verified if required)
    if (user && !loading) {
      // You can add additional validation checks here if needed
      // For example, check if email is verified: user.emailVerified
      setIsUserValid(true);
    } else {
      setIsUserValid(false);
    }
  }, [user, loading]);

  // Adapt Firebase user to match NextAuth user format expected by UserAccountNav
  const adaptedUser = user ? {
    name: user.displayName || 'User',
    email: user.email || '',
    image: user.photoURL || '',
  } : null;

  return (
    <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300 py-2">
      <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto max-w-7xl">
        {/* Logo */}
        <Link
          href={"/"}
          className="flex items-center gap-2"
        >
          <p className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white">
            Aquizi
          </p>
        </Link>

        <div className="flex items-center">
          <ThemeToggle className="mr-4" />
          {loading ? (
            // Show loading state while checking authentication
            <Button disabled>Loading...</Button>
          ) : isUserValid && adaptedUser ? (
            <UserAccountNav user={adaptedUser} />
          ) : (
            <Link href="/firebase-auth">
              <Button>Sign In Firebase</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
