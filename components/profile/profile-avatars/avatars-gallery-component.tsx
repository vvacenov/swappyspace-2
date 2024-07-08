import { useReducer, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";
import TailwindSpinner from "../../ui/spinner/tailwind-spinner";
import { Repeat } from "lucide-react";
import { useAuth } from "@/lib/hooks/authContext";
import { setAvatar } from "@/_actions/_profiles/set-avatar";
import { useQueryClient } from "@tanstack/react-query";

const MAX_OFFSET = 104;
const IMAGES_PER_PAGE = 6;

interface State {
  images: string[];
  offset: number;
  isLoading: boolean;
  error: string | null;
}

interface AvatarGalleryProps {
  signal_upload: boolean;
  setSignalUpload: (value: boolean) => void;
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

const AvatarGallery: React.FC<AvatarGalleryProps> = ({
  signal_upload,
  setSignalUpload,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const getImages = useCallback(
    async (newOffset: number) => {
      try {
        dispatch({ type: "FETCH_START" });

        const response = await fetch(
          `/api/getAvatars?offset=${newOffset}&max_offset=${MAX_OFFSET}&img=${userId}`
        );
        const result = await response.json();

        if (!response.ok) {
          dispatch({ type: "FETCH_FAILURE", payload: result.message });
          return;
        }

        dispatch({
          type: "FETCH_SUCCESS",
          payload: { images: result.images, offset: newOffset },
        });
        setSignalUpload(false);

        // Automatski postavi novi avatar ako je signal_upload true
        if (signal_upload && result.images.length > 0) {
          handleSetAvatar(result.images[0]);
        }
      } catch (error) {
        dispatch({
          type: "FETCH_FAILURE",
          payload:
            "Something went wrong loading avatars. Please try again later.",
        });
      }
    },
    [signal_upload]
  );

  const retryFetch = useCallback(() => {
    dispatch({ type: "RESET_ERROR" });
    getImages(0);
  }, [getImages]);

  useEffect(() => {
    if (signal_upload) {
      getImages(0);
    }
  }, [signal_upload]);

  useEffect(() => {
    getImages(0);
  }, [getImages]);

  useEffect(() => {}, []);

  const imgURL = useMemo(() => {
    return state.images.map((url) => url);
  }, [state.images]);

  // Kreiraj niz Skeleton komponenti
  const skeletonArray = Array.from({ length: IMAGES_PER_PAGE });

  async function handleSetAvatar(url: string) {
    const { result, serverError } = await setAvatar(url, userId || "");
    if (serverError) {
      dispatch({
        type: "FETCH_FAILURE",
        payload: serverError.error_message,
      });

      return;
    }
    queryClient.refetchQueries({ queryKey: ["user"] });
    return;
  }

  return (
    <div className="select-none flex flex-col items-center mt-2 mb-2">
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
              onClick={() => handleSetAvatar(url)}
              className="rounded-md border hover:opacity-85 cursor-pointer object-contain overflow-hidden min-h-[100px] max-h-[100px] min-w-[100px] max-w-[100px]"
              key={url}
              src={url}
              alt=""
              width={110}
              height={110}
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
};

export default AvatarGallery;
