import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

const allowedFileTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const imageMaxSize = 2048 * 1024;

export async function POST(request: NextRequest) {
  const formData: FormData | null = await request.formData();

  if (!formData) {
    return NextResponse.json({ message: "Empty image request", status: 400 });
  }

  const images: File[] = [];
  formData.forEach((value) => {
    if (value instanceof File) {
      images.push(value);
    }
  });

  if (images.length === 0) {
    return NextResponse.json({ message: "No image to upload.", status: 400 });
  }

  const image = images[0]; // Uzmite samo prvi fajl

  if (!allowedFileTypes.includes(image.type)) {
    return NextResponse.json({
      message: "Only image format allowed.",
      status: 400,
    });
  }

  if (image.size > imageMaxSize) {
    return NextResponse.json({
      message: "Please select image up to 2MB in size.",
      status: 400,
    });
  }

  return await uploadUserAvatar(image);
}

async function uploadUserAvatar(file: File): Promise<
  NextResponse<{
    message: string;
    status: number;
  }>
> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json({ message: error.message, status: 401 });
    }

    if (!data?.user?.id) {
      return NextResponse.json({
        message: "Please, log in. Session expired",
        status: 401,
      });
    }
    const userId = data.user.id;

    // Upload new file
    const newFileName = `avatar-${uuidv4()}`;
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("user_avatars")
      .upload(`${userId}/${newFileName}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return NextResponse.json({
        message: "Error uploading file.",
        status: 500,
      });
    }

    // Fetch the list of files for the user to get the file name
    const { data: userImgList, error: userImgListError } =
      await supabase.storage.from("user_avatars").list(`${userId}`);

    if (userImgListError) {
      return NextResponse.json({
        message: userImgListError?.message,
        status: 500,
      });
    }

    const userImgFile = userImgList?.find(
      (img) => img.name.startsWith("avatar") && img.name !== newFileName
    );

    // Delete the old avatar if it exists
    if (userImgFile) {
      await supabase.storage
        .from("user_avatars")
        .remove([`${userId}/${userImgFile.name}`]);
    }

    return NextResponse.json({
      message: "File uploaded successfully",
      status: 200,
    });
  } catch (err) {
    return NextResponse.json({
      message: "Server error :( Try again later.",
      status: 500,
    });
  }
}
