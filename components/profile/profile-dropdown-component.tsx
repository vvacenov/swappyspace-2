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
import { LogOut, Edit, User2, Mail, Globe, Check, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import useUser from "@/lib/hooks/useUser";
import { logout } from "@/_actions/_auth/logout";
import { useEffect, useReducer, useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  profileNameTest,
  profileWebsiteTest,
  profileEmailTest,
} from "@/lib/zod-schemas/update-profile-schema";
import { updateUserProfile } from "@/_actions/_profiles/update-profile";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import TailwindSpinner from "../ui/spinner/tailwind-spinner";
import AvatarGallery from "./profile-avatars/avatars-gallery-component";
import AvatarUpload from "@/components/profile/uploads/avatar-upload-component";
import ProfileFallbackImage from "@/public/logo/swappyspace-round.svg";
import Image from "next/image";
import { useSetAtom } from "jotai";
import { loggedInAtom } from "@/lib/atoms/auth";

// Define the state and action types
interface State {
  isEditing: boolean;
  name: string;
  website: string;
  email: string;
  avatar: boolean;
  errors: {
    name?: string;
    website?: string;
    email?: string;
    server?: string;
  };
}

interface Action {
  type: string;
  payload?: Partial<State>;
}

// Initial state
const initialState: State = {
  isEditing: false,
  name: "",
  website: "",
  email: "",
  avatar: false,
  errors: {},
};

// Reducer function
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, ...action.payload };
    case "SET_ERRORS":
      return { ...state, errors: action.payload || {} };
    case "TOGGLE_EDITING":
      return { ...state, isEditing: !state.isEditing };
    case "SET_EDITING":
      return { ...state, isEditing: true };
    case "RESET_EDITING":
      return { ...state, isEditing: false, ...action.payload };
    case "TOGGLE_AVATAR":
      return {
        ...state,
        avatar: !state.avatar,
        isEditing: false,
        ...action.payload,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const Profile: React.FC = () => {
  const setLoggedIn = useSetAtom(loggedInAtom);
  const { isFetching, data, error: fetchError } = useUser();
  const queryClient = useQueryClient();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { isEditing, name, website, email, avatar, errors } = state;

  const nameInputRef = useRef<HTMLInputElement>(null);
  const websiteInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    if (data) {
      dispatch({
        type: "SET_DATA",
        payload: {
          name: data.full_name || "",
          website: data.website || "",
          email: data.email || "",
        },
      });
    }
  }, [data]);

  useEffect(() => {
    if (isEditing) {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (websiteInputRef.current) {
        websiteInputRef.current.focus();
      } else if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }
  }, [isEditing]);

  const handleLogout = useCallback(async () => {
    await logout();
    setLoggedIn(false);
    await queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [setLoggedIn, queryClient]);

  const handleCancel = useCallback(() => {
    dispatch({
      type: "SET_DATA",
      payload: {
        name: data?.full_name || "",
        website: data?.website || "",
        email: data?.email || "",
      },
    });
    dispatch({ type: "SET_ERRORS", payload: {} });
    dispatch({
      type: "RESET_EDITING",
      payload: {
        name: data?.full_name || "",
        website: data?.website || "",
        email: data?.email || "",
      },
    });
  }, [data]);

  const handleConfirm = useCallback(async () => {
    let testUsername = name.trim();
    let testURL = website.trim();
    let testEmail = email.trim();

    const newErrors: State["errors"] = {};

    if (!testUsername) {
      newErrors.name = "Please enter a username";
    } else {
      const usernameTestResult = profileNameTest.safeParse({
        name: testUsername,
      });
      if (!usernameTestResult.success) {
        newErrors.name = usernameTestResult.error.errors[0].message;
      }
    }

    if (testURL && !/^https?:\/\//.test(testURL)) {
      testURL = `http://${testURL}`;
    }

    if (testURL) {
      const websiteUpdate = profileWebsiteTest.safeParse({ website: testURL });
      if (!websiteUpdate.success) {
        newErrors.website = websiteUpdate.error.errors[0].message;
      }
    }

    const emailUpdate = profileEmailTest.safeParse({ email: testEmail });
    if (!emailUpdate.success) {
      newErrors.email = emailUpdate.error.errors[0].message;
    }

    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: "SET_ERRORS", payload: newErrors });
      return;
    }

    const { serverError, result } = await updateUserProfile({
      full_name: testUsername,
      website: testURL || "",
      email: testEmail,
    });

    if (serverError) {
      newErrors.server = serverError.error_message;
      dispatch({ type: "SET_ERRORS", payload: newErrors });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["user"] });
    handleCancel();
  }, [name, website, email, queryClient, handleCancel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleConfirm();
      }
    },
    [handleConfirm]
  );

  const handleDoubleClick = useCallback(
    (inputRef: React.RefObject<HTMLInputElement>) => {
      dispatch({ type: "SET_EDITING" });
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    },
    []
  );

  const iconClass = "w-6 h-6 text-swappy";
  const iconContainerClass = "flex items-center justify-center w-10";
  const inputClass = "h-7 p-0 pl-2 focus-visible:ring-swappy w-[272px]";
  const rowClass =
    "select-none grid grid-flow-col gap-4 min-h-10 justify-start items-center px-3 hover:bg-muted rounded text-sm cursor-pointer";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger onClick={() => dispatch({ type: "TOGGLE_EDITING" })}>
        <ProfileIcon data={data} isFetching={isFetching} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[420px] hidden lg:grid select-none"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="flex gap-3 justify-start max-w-full my-2">
          <Avatar className="hover:opacity-90 rounded-md w-28 h-28 select-none hover:shadow-sm flex items-center justify-center transition-all ease-in duration-100 border-2">
            <div className="z-11">
              {isFetching && (
                <AvatarFallback className="bg-muted">
                  <TailwindSpinner />
                </AvatarFallback>
              )}
              <AvatarImage
                className="object-contain"
                src={data?.avatar_url || ""}
                width={110}
                height={110}
              />
              {!isFetching && (
                <AvatarFallback className="object-contain ">
                  <Image
                    src={data?.avatar_url || ProfileFallbackImage}
                    width={110}
                    height={110}
                    alt=""
                  />
                </AvatarFallback>
              )}
            </div>
          </Avatar>

          {!avatar && (
            <div
              className="border-2 rounded-md w-full h-full top-0 left-0 z-0 opacity-25 hover:opacity-100 flex flex-col items-center justify-center hover:cursor-pointer"
              onClick={() => {
                dispatch({
                  type: "TOGGLE_AVATAR",
                  payload: {
                    name: data?.full_name || "",
                    website: data?.website || "",
                    email: data?.email || "",
                  },
                });
              }}
            >
              <Edit className={iconClass} />
              <span className="text-swappy">Change avatar</span>
            </div>
          )}
          {avatar && (
            <div className="select-none relative p-3 border rounded-md w-[266px] min-h-[110px] max-h-auto flex flex-col items-center justify-center z-12">
              <div className="absolute -top-3 -right-2 border-2 rounded-full w-10 h-10 p-1 hover:cursor-pointer bg-primary-foreground hover:text-swappy hover:bg-muted z-1000 flex items-center justify-center">
                <X
                  className={`${iconClass} z-30`}
                  onClick={() =>
                    dispatch({
                      type: "TOGGLE_AVATAR",
                      payload: {
                        name: data?.full_name || "",
                        website: data?.website || "",
                        email: data?.email || "",
                      },
                    })
                  }
                />
              </div>
              <AvatarUpload setSignalUpload={setUploaded} />
            </div>
          )}
        </DropdownMenuLabel>

        {!avatar && (
          <>
            <div
              className={rowClass}
              onClick={() => dispatch({ type: "TOGGLE_EDITING" })}
            >
              <div className={iconContainerClass}>
                <Edit className={iconClass} />
              </div>
              <span>{isEditing ? "Editing details" : "Edit details"}</span>
              {isEditing && (
                <div className="flex items-center justify-end gap-4 ml-auto">
                  <div className={iconContainerClass}>
                    <Check
                      className={`${iconClass} text-green-500`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirm();
                      }}
                    />
                  </div>
                  <div className={iconContainerClass}>
                    <X
                      className={`${iconClass} text-red-500`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel();
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div
              className={rowClass}
              onDoubleClick={() => handleDoubleClick(nameInputRef)}
            >
              <div className={iconContainerClass}>
                <User2 className={iconClass} />
              </div>
              {isEditing ? (
                <Input
                  ref={nameInputRef}
                  className={inputClass}
                  value={name}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_DATA",
                      payload: { name: e.target.value },
                    })
                  }
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <span className="break-words truncate">{name || ""}</span>
              )}
            </div>

            <div
              className={rowClass}
              onDoubleClick={() => handleDoubleClick(emailInputRef)}
            >
              <div className={iconContainerClass}>
                <Mail className={iconClass} />
              </div>
              {isEditing ? (
                <Input
                  ref={emailInputRef}
                  className={inputClass}
                  value={email}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_DATA",
                      payload: { email: e.target.value },
                    })
                  }
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <span className="break-words truncate">{email || ""}</span>
              )}
            </div>

            <div
              className={rowClass}
              onDoubleClick={() => handleDoubleClick(websiteInputRef)}
            >
              <div className={iconContainerClass}>
                <Globe className={iconClass} />
              </div>
              {isEditing ? (
                <Input
                  ref={websiteInputRef}
                  className={inputClass}
                  value={website}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_DATA",
                      payload: { website: e.target.value },
                    })
                  }
                  placeholder="https://"
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <span className="break-words truncate">{website || ""}</span>
              )}
            </div>

            <DropdownMenuSeparator />
          </>
        )}
        {avatar && (
          <>
            <div className="select-none bg-muted rounded-sm shadow-inner">
              <AvatarGallery
                signal_upload={uploaded}
                setSignalUpload={setUploaded}
              />
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        {(errors.email || errors.name || errors.website || errors.server) && (
          <>
            <DropdownMenuItem className="flex flex-col text-red-400 justify-center items-center text-xs gap-2 m-1 px-4 text-center">
              {errors.name && <span>{errors.name}</span>}
              {errors.email && <span>{errors.email}</span>}
              {errors.website && <span>{errors.website}</span>}
              {errors.server && <span>{errors.server}</span>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <div className={rowClass} onClick={handleLogout}>
          <div className={iconContainerClass}>
            <LogOut className={iconClass} />
          </div>
          <span>Log out</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Profile;
