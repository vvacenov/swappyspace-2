"use server";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { headers } from "next/headers";
import { rateLimiter } from "@/lib/rate-limit/ratelimiter";
import xss from "xss";

const allowedFileTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const imageMaxSize = 2048 * 1024; // 2MB

interface UploadAvatarResult {
  message: string;
  status: number;
  error: boolean;
}

export async function uploadAvatar(
  formData: FormData
): Promise<UploadAvatarResult> {
  const ip = headers().get("x-forwarded-for");
  if (!ip) {
    console.log("IP address not found");
    return {
      message: "Server error: IP address not found",
      status: 404,
      error: true,
    };
  }

  const limit = await rateLimiter.limit(ip);

  if (!limit.success) {
    return { message: "Too many requests", status: 429, error: true };
  }

  const file = formData.get("image") as File | undefined;
  if (!file) {
    return { message: "Nothing to upload.", status: 400, error: true };
  }
  if (!allowedFileTypes.includes(file.type)) {
    return { message: "Only image format allowed.", status: 400, error: true };
  }

  if (file.size > imageMaxSize) {
    return {
      message: "Please select an image up to 2MB in size.",
      status: 400,
      error: true,
    };
  }

  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return { message: error.message, status: 401, error: true };
    }

    if (!data?.user?.id) {
      return {
        message: "Please, log in. Session expired",
        status: 401,
        error: true,
      };
    }

    const userId = xss(data.user.id); // Sanitiziraj userId
    const newFileName = `avatar-${uuidv4()}`;

    const { error: uploadError } = await supabase.storage
      .from("user_avatars")
      .upload(`${userId}/${newFileName}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return { message: "Error uploading file.", status: 500, error: true };
    }

    const { data: userImgList, error: userImgListError } =
      await supabase.storage.from("user_avatars").list(`${userId}`);

    if (userImgListError) {
      console.error("Error listing user images:", userImgListError);
      return { message: userImgListError?.message, status: 500, error: true };
    }

    const userImgFile = userImgList?.find(
      (img) => img.name.startsWith("avatar") && img.name !== newFileName
    );

    if (userImgFile) {
      const { error: removeError } = await supabase.storage
        .from("user_avatars")
        .remove([`${userId}/${userImgFile.name}`]);
      if (removeError) {
        console.error("Error removing old avatar:", removeError);
        return {
          message: "Error removing old avatar.",
          status: 500,
          error: true,
        };
      }
    }

    return { message: "File uploaded successfully", status: 200, error: false };
  } catch (err) {
    console.error("Server error:", err);
    return {
      message: "Server error :( Try again later.",
      status: 500,
      error: true,
    };
  }
}
