"use server";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AVATARS_BASEURL, USER_AVATARS_BASERL } from "@/lib/API/avatar_URLs";

export async function GET(request: NextRequest) {
  const supabase = createClient();

  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    let MAX_OFFSET = parseInt(searchParams.get("max_offset") || "100", 10);
    let limit = 6;
    let userImg: string | null = null;

    const userId = searchParams.get("img" || "") as string;

    // Fetch the list of files for the user to get the file extension
    if (offset === 0) {
      const { data: userImgList, error: userImgListError } =
        await supabase.storage.from("user_avatars").list(`${userId}`);

      if (userImgListError) {
        return NextResponse.json(
          { message: userImgListError.message },
          { status: 500 }
        );
      }
      userImg =
        userImgList?.find((img) => img.name.startsWith("avatar"))?.name || null;

      if (userImg && offset === 0) {
        limit = 5;
      }
    }

    // Assuming there's only one avatar per user, find the file with 'avatar' prefix

    const { data, error } = await supabase.storage.from("avatars").list("", {
      limit: limit,
      offset: offset < MAX_OFFSET ? offset : MAX_OFFSET,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const imageNames = data.map((img) => AVATARS_BASEURL + img.name);
    if (userImg) {
      imageNames.unshift(USER_AVATARS_BASERL + `${userId}/` + userImg);
    }

    return NextResponse.json({ images: imageNames }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
