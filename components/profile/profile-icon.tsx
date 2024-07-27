"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TailwindSpinner from "../ui/spinner/tailwind-spinner";
import Image from "next/image";
import profileIcon from "@/public/logo/swappyspace-round.svg";

import type { User } from "@/utils/types/user";

export default function ProfileIcon({
  isFetching,
  data,
}: {
  isFetching: boolean;
  data: User | undefined;
}) {
  return (
    <Avatar className="border border-muted hover:cursor-pointer select-none hover:shadow-sm hover:opacity-85 transition-all ease-in duration-100 active:scale-90 active:opacity-85">
      {isFetching && (
        <AvatarFallback className="bg-muted">
          <TailwindSpinner />
        </AvatarFallback>
      )}
      <AvatarImage className="object-cover" src={data?.avatar_url || ""} />
      {!isFetching && (
        <AvatarFallback className="bg-muted">
          <Image
            src={data?.avatar_url || profileIcon}
            width={110}
            height={110}
            alt=""
          />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
