"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { LogOut, User as UserIcon, ListTodo, Settings, BookOpen, History, CreditCard, HelpCircle, Upload } from "lucide-react";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { useRouter } from "next/navigation";

type Props = {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

const UserAccountNav = ({ user }: Props) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none" aria-label="User menu">
        <UserAvatar
          className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary/10 hover:border-primary/30 transition-colors"
          user={{
            name: user.name || null,
            image: user.image || null,
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white dark:bg-gray-950 w-56 sm:w-64 shadow-lg rounded-lg border border-gray-200 dark:border-gray-800"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-start gap-1 sm:gap-2 p-2 sm:p-3 border-b border-gray-100 dark:border-gray-800">
          <UserAvatar
            className="w-8 h-8 sm:w-10 sm:h-10"
            user={{
              name: user.name || null,
              image: user.image || null,
            }}
          />
          <div className="flex flex-col space-y-0.5 sm:space-y-1 leading-none">
            {user.name && <p className="font-medium text-sm sm:text-base">{user.name}</p>}
            {user.email && (
              <p className="w-[140px] sm:w-[180px] truncate text-xs sm:text-sm text-zinc-700 dark:text-white">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <div className="p-1 sm:p-1.5">
          {/* Main Navigation */}
          <DropdownMenuItem asChild className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <Link href="/dashboard" className="flex items-center w-full">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <Link href="/firebase-dashboard" className="flex items-center w-full">
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Profile
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Quiz Actions */}
          <DropdownMenuItem asChild className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <Link href="/quiz" className="flex items-center w-full">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Create Quiz
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <Link href="/upload-quizz/new" className="flex items-center w-full">
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Upload Quiz
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <Link href="/history" className="flex items-center w-full">
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              History
            </Link>
          </DropdownMenuItem>
          
          <div className="h-px bg-gray-200 dark:bg-gray-800 my-1 mx-2"></div>
          
          {/* Additional Features */}
          <DropdownMenuItem asChild className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <Link href="/firebase-todos" className="flex items-center w-full">
              <ListTodo className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Todos
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <Link href="/billing" className="flex items-center w-full">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Billing
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <a href="https://github.com/micheldevweb/aquizi" target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Help & Support
            </a>
          </DropdownMenuItem>

          <div className="h-px bg-gray-200 dark:bg-gray-800 my-1 mx-2"></div>
          
          {/* Logout */}
          <DropdownMenuItem
            onSelect={() => handleSignOut()}
            className="text-red-600 cursor-pointer text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
