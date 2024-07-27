"use server";

import { createClient } from "@/utils/supabase/server";
import { AVATARS_BASEURL, USER_AVATARS_BASERL } from "@/lib/API/avatar_URLs";

interface GetAvatarsResult {
  images?: string[];
  message?: string;
  error: boolean;
}

export async function getAvatars(
  offset: number,
  userId: string
): Promise<GetAvatarsResult> {
  try {
    const supabase = createClient();
    let limit = 6;
    let userImg: string | null = null;

    if (offset === 0) {
      const { data: userImgList, error: userImgListError } =
        await supabase.storage.from("user_avatars").list(`${userId}`);

      if (userImgListError) {
        return { message: userImgListError.message, error: true };
      }

      userImg =
        userImgList?.find((img) => img.name.startsWith("avatar"))?.name || null;

      if (userImg) {
        limit -= 1;
      }
    }

    const { data, error } = await supabase.storage.from("avatars").list("", {
      limit: limit,
      offset,
    });

    if (error) {
      return { message: error.message, error: true };
    }

    const imageNames = data.map((img) => AVATARS_BASEURL + img.name);
    if (userImg) {
      imageNames.unshift(USER_AVATARS_BASERL + `${userId}/` + userImg);
    }

    return { images: imageNames, error: false };
  } catch (error) {
    return { message: "Something went wrong", error: true };
  }
}
