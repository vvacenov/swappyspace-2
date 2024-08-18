import { atom } from "jotai";
import { createClient } from "@/utils/supabase/client";

export const loggedInAtom = atom<boolean>(false);
export const loadingAtom = atom<boolean>(true);
export const errorAtom = atom<string | null>(null);
export const userIdAtom = atom<string | null>(null);

export const checkUserAtom = atom(null, async (get, set) => {
  const supabase = createClient();
  set(loadingAtom, true);
  set(errorAtom, null);

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      set(errorAtom, error.message);
      set(loggedInAtom, false);
    } else {
      set(loggedInAtom, !!data?.session);
      set(userIdAtom, data?.session?.user?.id || null);
    }
  } catch (error) {
    set(loggedInAtom, false);
    set(errorAtom, "Something went wrong on our end. Please try again.");
  } finally {
    set(loadingAtom, false);
  }
});
