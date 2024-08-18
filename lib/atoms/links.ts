import { atom } from "jotai";

type ShortLink = {
  created: boolean;
  short_url: string;
  long_url: string;
};

export const shortlinkInitVal = { created: false, short_url: "", long_url: "" };

export const shortLinkAtom = atom<ShortLink>(shortlinkInitVal);
