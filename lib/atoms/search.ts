import { LinksFilter } from "@/utils/types/types";
import { atom } from "jotai";

export const initFilter: LinksFilter = {
  id: null,
  created_at: null,
  tags: null,
  excat_tags: false,
  url_long: null,
  asc: false,
};

export const linksFilterAtom = atom(initFilter);
