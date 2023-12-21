"use client";

import Image from "next/image";
import { useState, useRef } from "react";

import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PutBlobResult } from "@vercel/blob";

interface ImageUploadProps {
  disable?: boolean;
  value: string[];
}
const ImageUpload: React.FC<ImageUploadProps> = ({ disable, value }) => {
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  const inputFileRef = useRef<HTMLInputElement>(null);

  const onChangeImage = async () => {
    if (!inputFileRef.current?.files) {
      throw new Error("No file selected");
    }

    const file = inputFileRef.current?.files?.[0];

    const response = await fetch(`/api/images?filename=${file.name}`, {
      method: "POST",
      body: file,
    });

    const newBlob = (await response.json()) as PutBlobResult;

    setBlob(newBlob);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <div className="relative w-[250px] h-[250px] rounded-md overflow-hidden">
          <div className="z-10 absolute top-2 right-2">
            <Button type="button" variant="destructive" size="icon">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          {/* <Image fill className="object-cover" alt="Image" src={blob.url} /> */}
        </div>
      </div>
      <Input
        name="image"
        ref={inputFileRef}
        type="file"
        accept="image/*"
        onChange={onChangeImage}
        disabled={disable}
        required
        className="w-[250px] bg-gray-200"
      />
    </div>
  );
};

export default ImageUpload;
