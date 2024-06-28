import React, { useEffect } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import { Button } from "../ui/button";

const UppyComponent: React.FC = () => {
  const uppy = new Uppy({
    restrictions: {
      maxFileSize: 1000000, // 1MB
      maxNumberOfFiles: 1,
      minNumberOfFiles: 1,
      allowedFileTypes: ["image/*"],
    },
    autoProceed: false,
  });

  uppy.use(XHRUpload, {
    endpoint: "https://my-upload-endpoint.com/upload",
    fieldName: "files",
  });

  useEffect(() => {
    return () => uppy.close();
  }, [uppy]);

  uppy.on("complete", (result) => {
    console.log(
      "Upload complete! We’ve uploaded these files:",
      result.successful
    );
  });

  return (
    <div>
      <Dashboard
        uppy={uppy}
        proudlyDisplayPoweredByUppy={false}
        locale={{
          strings: {
            dropPasteFiles: "Drop image here or %{browse}",
          },
        }}
      />
    </div>
  );
};

export default UppyComponent;
