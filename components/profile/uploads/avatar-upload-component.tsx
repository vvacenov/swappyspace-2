import { useReducer } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "../../ui/button";
import TailwindSpinner from "../../ui/spinner/tailwind-spinner";
import { Check, X } from "lucide-react";
import { useAtomValue } from "jotai";
import { userIdAtom } from "@/lib/atoms/auth";
import { uploadAvatar } from "@/_actions/_profiles/upload-avatar";

const allowedFileTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const imageMaxSize = 2048 * 1024;

interface State {
  image: File | null;
  error: string | null;
  uploadErr: boolean;
  progress: number;
  uploading: boolean;
  uploadDone: boolean;
  dragActive: boolean;
}

const initialState: State = {
  image: null,
  error: null,
  uploadErr: false,
  progress: 0,
  uploading: false,
  uploadDone: false,
  dragActive: false,
};

type Action =
  | { type: "SET_FILE"; payload: File | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_UPLOAD_ERR"; payload: boolean }
  | { type: "SET_PROGRESS"; payload: number }
  | { type: "SET_UPLOADING"; payload: boolean }
  | { type: "SET_UPLOAD_DONE"; payload: boolean }
  | { type: "SET_DRAG_ACTIVE"; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FILE":
      return { ...state, image: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_UPLOAD_ERR":
      return { ...state, uploadErr: action.payload };
    case "SET_PROGRESS":
      return { ...state, progress: action.payload };
    case "SET_UPLOADING":
      return { ...state, uploading: action.payload };
    case "SET_UPLOAD_DONE":
      return { ...state, uploadDone: action.payload };
    case "SET_DRAG_ACTIVE":
      return { ...state, dragActive: action.payload };
    default:
      return state;
  }
}

interface AvatarGalleryProps {
  setSignalUpload: (value: boolean) => void;
}

const AvatarUpload: React.FC<AvatarGalleryProps> = ({ setSignalUpload }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const userId = useAtomValue(userIdAtom);

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_PROGRESS", payload: 0 });
    dispatch({ type: "SET_UPLOADING", payload: true });
    dispatch({ type: "SET_UPLOAD_ERR", payload: false });

    if (!state.image) {
      dispatch({
        type: "SET_ERROR",
        payload: "Please, first select an image to upload.",
      });
      dispatch({ type: "SET_UPLOADING", payload: false });
      return;
    }

    const time =
      (state.image.size <= 524288 && 110) ||
      (state.image.size > 524288 && state.image.size < 1048576 && 220) ||
      330;

    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue = progressValue + Math.round(Math.random() * 10);
      if (progressValue >= 83) {
        progressValue = 94; // Simulacija napretka do 94%
        clearInterval(interval);
      }
      dispatch({ type: "SET_PROGRESS", payload: progressValue });
    }, time);

    try {
      const image = new FormData();
      image.set("image", state.image);
      const result = await uploadAvatar(image);

      if (result.error) {
        dispatch({ type: "SET_ERROR", payload: result.message });
        dispatch({ type: "SET_UPLOAD_ERR", payload: true });
        dispatch({ type: "SET_UPLOADING", payload: false });
        return;
      }

      dispatch({ type: "SET_PROGRESS", payload: 100 });
      dispatch({ type: "SET_UPLOAD_DONE", payload: true });
      dispatch({ type: "SET_UPLOADING", payload: false });
      setSignalUpload(true);
    } catch (err: any) {
      dispatch({ type: "SET_UPLOAD_ERR", payload: true });
      if (err instanceof Error) {
        dispatch({ type: "SET_ERROR", payload: err.message });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: "Something went wrong, try again later.",
        });
      }
      dispatch({ type: "SET_UPLOADING", payload: false });
      dispatch({ type: "SET_PROGRESS", payload: 0 });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DRAG_ACTIVE", payload: true });
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DRAG_ACTIVE", payload: false });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DRAG_ACTIVE", payload: false });
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (!allowedFileTypes.includes(files[0].type)) {
        dispatch({ type: "SET_ERROR", payload: "Only image format allowed." });
        return;
      }
      dispatch({ type: "SET_FILE", payload: files[0] });
      dispatch({ type: "SET_ERROR", payload: null });
      dispatch({ type: "SET_UPLOAD_DONE", payload: false });
      dispatch({ type: "SET_PROGRESS", payload: 0 });
      dispatch({ type: "SET_UPLOADING", payload: false });
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center overflow-hidden select-none ${
        state.dragActive
          ? "border border-dashed border-swappy rounded-md overflow-hidden"
          : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {state.uploadDone ? (
        <div className="flex h-auto text-xs items-center justify-center mt-2 gap-2">
          <Check className="text-green-500 w-6 h-6" />
          <span>Upload complete</span>
        </div>
      ) : (
        <form onSubmit={handleOnSubmit} className="w-full">
          <label className="flex w-full items-center justify-center">
            <span className="sr-only">Browse for Image</span>
            <input
              type="file"
              name="image"
              accept={allowedFileTypes.join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && !allowedFileTypes.includes(file.type)) {
                  dispatch({
                    type: "SET_ERROR",
                    payload: "Only image format allowed.",
                  });
                  return;
                }
                dispatch({ type: "SET_FILE", payload: file });
                dispatch({ type: "SET_ERROR", payload: null });
                dispatch({ type: "SET_UPLOAD_DONE", payload: false });
                dispatch({ type: "SET_PROGRESS", payload: 0 });
                dispatch({ type: "SET_UPLOADING", payload: false });
              }}
              disabled={state.uploading}
              id="fileInput"
            />
            {!state.image && (
              <div className="flex flex-col items-center justify-center">
                <span className="flex text-sm px-4 py-1 cursor-pointer bg-muted rounded m-2">
                  Upload your own Image
                </span>
                <span className="text-swappy text-xs">
                  or drag and drop your image here
                </span>
              </div>
            )}
            {state.image && state.error && (
              <div className="flex flex-col items-center justify-center">
                <span className="flex text-sm px-4 py-1 cursor-pointer bg-muted rounded m-2">
                  Browse again
                </span>
              </div>
            )}
          </label>
          {state.image?.name && !state.uploading && !state.error && (
            <>
              <div className="flex items-center text-xs text-swappy justify-center">
                <span>{state.image.name}</span>
              </div>
              <Button
                type="submit"
                className="h-7 flex flex-col gap-2 items-center justify-center w-full mt-1 mb-1"
              >
                Upload
              </Button>
            </>
          )}
        </form>
      )}
      {state.uploading && !state.uploadDone && (
        <div className="flex flex-col gap-2 items-center justify-center w-full mt-2">
          <TailwindSpinner />
          <span className="text-xs">Please wait...</span>
          <Progress value={state.progress} />
        </div>
      )}

      {state.error && (
        <div className="flex h-auto flex-col items-center justify-center">
          <div className="text-red-500 text-xs w-full mt-2 text-center">
            {state.error}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
