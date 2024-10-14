import { DropzoneOptions, useDropzone } from "react-dropzone";
import { twMerge } from "tailwind-merge";

export interface PFPDropzoneProps {
  onDrop: DropzoneOptions["onDrop"];
}

export interface DropZoneFile extends File {
  path: string;
}

const PFPDropzone = ({ onDrop }: PFPDropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex items-center justify-center w-full h-full p-16 cursor-pointer"
    >
      <div
        className={twMerge(
          "flex items-center w-48 h-32 p-8 transition-colors bg-white border border-indigo-500 border-dashed rounded-xl hover:bg-indigo-100",
          isDragActive && "bg-indigo-100"
        )}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center">Drop the image here ...</p>
        ) : (
          <p className="text-center">
            Drag 'n' drop image or click to select file
          </p>
        )}
      </div>
    </div>
  );
};

export default PFPDropzone;
