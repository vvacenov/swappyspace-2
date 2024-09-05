"use server";

import { createClient } from "@/utils/supabase/server";
import { AVATARS_BASEURL, USER_AVATARS_BASERL } from "@/lib/API/avatar_URLs";
import xss from "xss";

interface GetAvatarsResult {
  images?: string[];
  message?: string;
  error: boolean;
}

export async function getAvatars(
  offset: number,
  userId: string
): Promise<GetAvatarsResult> {
  const supabase = createClient();

  try {
    let limit = 6;
    let userImg: string | null = null;

    // Sanitiziraj userId pomoću xss
    const sanitizedUserId = xss(userId);

    if (offset === 0) {
      const { data: userImgList, error: userImgListError } =
        await supabase.storage.from("user_avatars").list(`${sanitizedUserId}`);

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
      imageNames.unshift(USER_AVATARS_BASERL + `${sanitizedUserId}/` + userImg);
    }

    return { images: imageNames, error: false };
  } catch (error) {
    return { message: "Something went wrong", error: true };
  }
}
