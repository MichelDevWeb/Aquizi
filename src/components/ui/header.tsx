'use client';

import { Button } from "./button";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavMenu } from "@/components/NavMenu";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { useRouter } from "next/navigation";

function SignOut() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
    >
      Sign Out
    </Button>
  );
}

const Header = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <header>
        <nav className="px-4 py-2.5">
          <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <Link href="/dashboard">
              <h1 className="text-3xl font-bold">Aquizi</h1>
            </Link>
            <Button disabled>Loading...</Button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header>
      <nav className="px-4 py-2.5">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link href="/dashboard">
            <h1 className="text-3xl font-bold">Aquizi</h1>
          </Link>

          <div>
            {user ? (
              <div className="flex items-center gap-4">
                {user.displayName && user.photoURL && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <Image
                          src={user.photoURL}
                          alt={user.displayName}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <NavMenu />
                  </DropdownMenu>
                )}
                <SignOut />
              </div>
            ) : (
              <Link href="/firebase-auth">
                <Button
                  variant="link"
                  className="rounded-xl border"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
