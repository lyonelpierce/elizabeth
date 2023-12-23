"use client";

import Image from "next/image";
import { ChangeEvent } from "react";

import { Loader2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageUploadComponentProps {
  isLoading: boolean;
  billboardImage?: string | null;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  isLoading,
  billboardImage,
  onImageChange,
}) => {
  return (
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
            <div className="absolute h-52 w-72 rounded-md overflow-hidden">
              {billboardImage && (
                <Image
                  fill
                  className="object-cover"
                  alt="Image"
                  src={billboardImage}
                />
              )}
            </div>
          </>
        )}
      </div>
      <Input
        id="image-upload"
        className="sr-only"
        type="file"
        accept=".jpg, .jpeg, .png, .webp"
        disabled={isLoading}
        onChange={onImageChange}
      />
    </Label>
  );
};

export default ImageUploadComponent;
