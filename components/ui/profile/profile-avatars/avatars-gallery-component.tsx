import { createClient } from "@/utils/supabase/client";
import useUser from "@/lib/hooks/useUser";
import { useReducer, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "../../button";
import { Skeleton } from "../../skeleton";
import TailwindSpinner from "../../spinner/tailwind-spinner";
import { Repeat } from "lucide-react";

const MAX_OFFSET = 107;
const IMAGES_PER_PAGE = 6;

interface State {
  images: string[];
  offset: number;
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: { images: string[]; offset: number } }
  | { type: "FETCH_FAILURE"; payload: string }
  | { type: "RESET_ERROR" };

const initialState: State = {
  images: [],
  offset: 0,
  isLoading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        images: action.payload.images,
        offset: action.payload.offset,
        isLoading: false,
      };
    case "FETCH_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
    case "RESET_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export default function AvatarGallery() {
  const user = useUser();
  const supabase = createClient();
  const [state, dispatch] = useReducer(reducer, initialState);

  const getImages = useCallback(
    async (newOffset: number) => {
      try {
        dispatch({ type: "FETCH_START" });

        const { data, error } = await supabase.storage
          .from("avatars")
          .list("", {
            limit: IMAGES_PER_PAGE,
            offset: newOffset < MAX_OFFSET ? newOffset : MAX_OFFSET,
          });
        if (error) {
          dispatch({ type: "FETCH_FAILURE", payload: error.message });
          return;
        }
        if (data) {
          const imageNames = data.map((img) => img.name);
          dispatch({
            type: "FETCH_SUCCESS",
            payload: { images: imageNames, offset: newOffset },
          });
        }
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload:
            "Something went wrong loading avatars. Please try again later.",
        });
      }
    },
    [supabase]
  );

  const retryFetch = useCallback(() => {
    dispatch({ type: "RESET_ERROR" });
    getImages(0);
  }, [getImages]);

  useEffect(() => {
    getImages(0);
  }, [getImages]);

  const BASEURL =
    "https://lrfapwkpjlxzbddoyeuh.supabase.co/storage/v1/object/public/avatars/";
  const imgURL = useMemo(() => {
    return state.images.map((name) => BASEURL + name);
  }, [state.images, supabase]);

  // Kreiraj niz Skeleton komponenti
  const skeletonArray = Array.from({ length: IMAGES_PER_PAGE });

  return (
    <div className="flex flex-col items-center mt-2 mb-2">
      {state.error && (
        <div className="flex w-[410px] h-[280px] justify-center items-center flex-col gap-4">
          <span className="text-center text-wrap">{state.error}</span>
          <Repeat
            className="h-10 w-10 text-swappy cursor-pointer"
            onClick={retryFetch}
          />
        </div>
      )}
      {!state.isLoading && !state.error && (
        <div className="grid grid-cols-3 gap-4 mb-2 ">
          {imgURL?.map((url) => (
            <Image
              className="rounded-md border hover:opacity-85 cursor-pointer"
              key={url}
              src={url}
              alt=""
              width={100}
              height={100}
              priority
            />
          ))}
        </div>
      )}
      {state.isLoading && !state.error && (
        <div className="grid grid-cols-3 gap-4 mb-2 ">
          {skeletonArray.map((_, index) => (
            <Skeleton
              key={index}
              className="rounded-md w-[100px] h-[100px] border bg-[#b190b7] flex items-center justify-center"
            >
              <TailwindSpinner />
            </Skeleton>
          ))}
        </div>
      )}
      {!state.error && (
        <div className="mt-2">
          {state.offset !== 0 && (
            <Button
              onClick={() =>
                getImages(Math.max(0, state.offset - IMAGES_PER_PAGE))
              }
              className="mr-1 min-w-[90px] mb-2"
            >
              Back
            </Button>
          )}
          {state.offset < MAX_OFFSET && (
            <Button
              className="mr-1 min-w-[90px] mb-2"
              onClick={() => getImages(state.offset + IMAGES_PER_PAGE)}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
