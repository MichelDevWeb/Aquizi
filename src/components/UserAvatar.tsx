import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { type AvatarProps } from "@radix-ui/react-avatar";

interface Props extends AvatarProps {
  user: {
    name: string | null;
    image: string | null;
  };
}

const UserAvatar = ({ user, ...props }: Props) => {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className="relative w-full h-full aspect-square">
          <Image
            fill
            src={user.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt="profile picture"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user?.name}</span>
          <span className="text-lg">{user?.name?.charAt(0) || '?'}</span>
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
