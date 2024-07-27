import { atom } from "jotai";

export const linksAtom = atom<{
  message: [];
  status: number;
  error: boolean;
} | null>(null);
