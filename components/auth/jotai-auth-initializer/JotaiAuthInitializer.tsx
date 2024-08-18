"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { checkUserAtom } from "@/lib/atoms/auth";

export function JotaiAuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkUser = useSetAtom(checkUserAtom);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return <>{children}</>;
}
