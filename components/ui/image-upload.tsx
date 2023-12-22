"use client";

import Image from "next/image";
import { useState, useRef } from "react";

import { Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PutBlobResult } from "@vercel/blob";
import { Label } from "./label";

interface ImageUploadProps {
  disable?: boolean;
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
}
const ImageUpload: React.FC<ImageUploadProps> = ({
  disable,
  value,
  onChange,
  onRemove,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const inputFileRef = useRef<HTMLInputElement>(null);

  const onChangeImage = async () => {
    setIsLoading(true);

    // Check if there is a previous image and remove it
    if (value.length > 0) {
      const previousImageUrl = value[0];

      try {
        await fetch(`/api/images?url=${encodeURIComponent(previousImageUrl)}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting previous image:", error);
      }

      // Trigger onRemove to remove the URL from the state
      onRemove(previousImageUrl);
    }

    // Upload the new image
    const file = inputFileRef.current?.files?.[0];

    try {
      if (!file) {
        return;
      }

      const response = await fetch(`/api/images?filename=${file.name}`, {
        method: "POST",
        body: file,
      });

      const newBlob = (await response.json()) as PutBlobResult;

      // Trigger onChange to update the state with the new image URL
      onChange(newBlob.url);
    } catch (error) {
      console.error("Error uploading new image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-72 h-52">
      <Label htmlFor="image-upload" className="relative">
        <div className="relative bg-gray-200 rounded-md h-52 w-72 flex flex-col items-center justify-center gap-2 cursor-pointer group">
          {isLoading ? (
            <div className="absolute bg-gray-300 rounded-md h-full w-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <Upload className="h-6 w-6 transition-transform ease-in-out delay-150 group-hover:scale-125" />
              Click to upload
              {value.map((url) => (
                <div
                  key={url}
                  className="absolute h-52 w-72 rounded-md overflow-hidden"
                >
                  <Image
                    fill
                    className="bg-gray-200 object-cover"
                    alt="Image"
                    src={url}
                  />
                </div>
              ))}
            </>
          )}
        </div>
        <Input
          id="image-upload"
          name="image"
          ref={inputFileRef}
          type="file"
          accept="image/*"
          onChange={onChangeImage}
          disabled={disable || isLoading}
          className="sr-only"
        />
      </Label>
    </div>
  );
};

export default ImageUpload;
