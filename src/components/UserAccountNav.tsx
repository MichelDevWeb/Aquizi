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
import { LogOut, User as UserIcon, ListTodo, Settings } from "lucide-react";
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
      <DropdownMenuTrigger>
        <UserAvatar
          className="w-10 h-10"
          user={{
            name: user.name || null,
            image: user.image || null,
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white dark:bg-gray-950"
        align="end"
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-zinc-700 dark:text-white">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/firebase-dashboard" className="flex items-center">
            <UserIcon className="w-4 h-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/firebase-todos" className="flex items-center">
            <ListTodo className="w-4 h-4 mr-2" />
            Todos
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => handleSignOut()}
          className="text-red-600 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
