"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProfileIcon from "./profile-icon";
import {
  LogOut,
  Edit,
  User2,
  Mail,
  Globe,
  Check,
  X,
  ImagePlus,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import useUser from "@/lib/hooks/useUser";
import { logout } from "@/_actions/_auth/logout";
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  profileNameTest,
  profileWebsiteTest,
} from "@/lib/zod-schemas/update-profile-schema";
import { updateUserProfile } from "@/_actions/_profiles/update-profile";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import TailwindSpinner from "../spinner/tailwind-spinner";
import profileIcon from "@/public/logo/swappyspace-round.svg";
import Image from "next/image";
import AvatarGallery from "./profile-avatars/avatars-gallery-component";
import { useAuth } from "@/lib/hooks/authContext";
import UppyComponent from "@/components/uploads/profile-upload-component";

const Profile: React.FC = () => {
  const { setLoggedIn } = useAuth();
  const { isFetching, data, error: fetchError } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(data?.full_name || "");
  const [website, setWebsite] = useState(data?.website || "");
  const [avatar, setAvatar] = useState(false);

  useEffect(() => {
    if (data) {
      setName(data.full_name || "");
      setWebsite(data.website || "");
    }
  }, [data]);

  const queryClient = useQueryClient();

  const handleLogout = useCallback(async () => {
    await logout();
    setLoggedIn(false); // Zamijeni loggedin sa setLoggedIn
    await queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [setLoggedIn, queryClient]); // Dodaj setLoggedIn

  const handleCancel = useCallback(() => {
    setName(data?.full_name || "");
    setWebsite(data?.website || "");
    setIsEditing(false);
  }, [data]);

  const handleConfirm = useCallback(async () => {
    let testUsername = name.trim();
    let testURL = website.trim();

    if (testUsername === data?.full_name && testURL === data?.website) {
      setIsEditing(false);
      return;
    }

    if (!testUsername) {
      console.log("Please enter a username");
      return;
    }

    const usernameTestResult = profileNameTest.safeParse({
      name: testUsername,
    });
    if (!usernameTestResult.success) {
      console.log(usernameTestResult.error.errors[0].message);
      return;
    }

    if (!testURL) {
      await updateUserProfile({ full_name: testUsername });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      handleCancel();
      return;
    }

    if (testURL && !/^https?:\/\//.test(testURL)) {
      testURL = `http://${testURL}`;
    }

    const websiteUpdate = profileWebsiteTest.safeParse({ website: testURL });
    if (!websiteUpdate.success) {
      console.log(websiteUpdate.error.errors[0].message);
      return;
    }

    await updateUserProfile({
      full_name: testUsername,
      website: testURL,
    });

    await queryClient.invalidateQueries({ queryKey: ["user"] });
    handleCancel();
  }, [name, website, data, queryClient, handleCancel]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger onClick={() => setIsEditing(false)}>
        <ProfileIcon data={data} isFetching={isFetching} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[420px] hidden lg:grid"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="relative flex gap-3 justify-start w-full my-2 ">
          <Avatar className="hover:opacity-90 rounded-md w-28 h-28 select-none hover:shadow-sm flex items-center justify-center transition-all ease-in duration-100  border-2">
            <div className="z-11">
              {isFetching && (
                <AvatarFallback className="bg-muted">
                  <TailwindSpinner />
                </AvatarFallback>
              )}
              <AvatarImage
                className="object-cover"
                src={data?.avatar_url || ""}
              />
              {!isFetching && (
                <AvatarFallback className="bg-muted">
                  <Image src={profileIcon} alt="profile" />
                </AvatarFallback>
              )}
            </div>
          </Avatar>

          {!avatar && (
            <div
              className="border-2 rounded-md w-full h-full top-0 left-0 z-0 opacity-25 hover:opacity-100 flex flex-col items-center justify-center hover:cursor-pointer"
              onClick={() => {
                setAvatar(!avatar);
                setIsEditing(false);
                setName(data?.full_name || "");
                setWebsite(data?.website || "");
              }}
            >
              <Edit className="w-12 h-12 p-1 text-swappy" />
              <span className="text-swappy">Change avatar</span>
            </div>
          )}
          {avatar && <UppyComponent />}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        {!avatar && (
          <>
            <DropdownMenuLabel className="flex gap-6 items-center">
              <div className="flex gap-2 items-center">
                <Edit
                  className={`min-h-12 min-w-12 p-1 cursor-pointer transition-all ease-in-out duration-100 ${
                    isEditing ? "text-swappy" : "hover:opacity-60"
                  }`}
                  onClick={() => setIsEditing(!isEditing)}
                />
                {!isEditing && <span>Edit details</span>}
              </div>
              {isEditing && (
                <div className="flex w-full">
                  <div className="flex items-center justify-start gap-6">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Check
                        className="text-green-500 min-w-9 min-h-9 p-1 rounded-md hover:bg-muted cursor-pointer border-2 border-swappy"
                        onClick={handleConfirm}
                      />
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center">
                      <X
                        className="text-red-500 min-w-9 min-h-9 p-1 rounded-md hover:bg-muted cursor-pointer border-2 border-swappy"
                        onClick={handleCancel}
                      />
                    </div>
                  </div>
                </div>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <div className="grid grid-flow-col gap-3 min-h-10 justify-start items-center pl-4 px-3 hover:bg-muted rounded text-sm">
              <span className="h-7">
                <User2 className="text-swappy w-7 h-7" />
              </span>
              {isEditing ? (
                <Input
                  className="h-7 p-0 pl-2 focus-visible:ring-swappy w-[272px]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <span className="break-words truncate">{name || ""}</span>
              )}
            </div>

            <div className="grid grid-flow-col gap-3 min-h-10 justify-start items-center pl-4 px-3 hover:bg-muted rounded text-sm">
              <span className="h-7">
                <Mail className="text-swappy w-7 h-7" />
              </span>
              <span className=" break-words truncate">{data?.email || ""}</span>
            </div>

            <div className="grid grid-flow-col gap-3 min-h-10 justify-start items-center pl-4 px-3 hover:bg-muted rounded text-sm">
              <span className="h-7">
                <Globe className="text-swappy w-7 h-7" />
              </span>
              {isEditing ? (
                <Input
                  className="h-7 p-0 pl-2 w-[272px] focus-visible:ring-swappy"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                />
              ) : (
                <span className=" break-words truncate">{website || ""}</span>
              )}
            </div>

            <DropdownMenuSeparator />
          </>
        )}
        {avatar && (
          <>
            <div className="bg-muted rounded-sm shadow-inner">
              <AvatarGallery />
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          className="flex gap-3 cursor-pointer text-base font-semibold hover:bg-muted"
          onClick={handleLogout}
        >
          <LogOut className="text-swappy min-h-12 min-w-12 p-1" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Profile;
