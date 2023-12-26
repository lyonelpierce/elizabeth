"use client";

import { useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Trash } from "lucide-react";
import { Billboard } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Heading from "@/components/ui/heading";
import toast from "react-hot-toast";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUploadComponent from "@/components/ui/image-upload";

interface BillboardsFormProps {
  initialData: Billboard | null;
}

const MAX_IMAGE_SIZE = 4000000;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.union([
    z.string(),
    z
      .custom<FileList>((val) => val instanceof FileList, "Image is required")
      .refine((files) => files.length > 0, "Image is required")
      .refine(
        (files) =>
          Array.from(files).every((file) => file.size <= MAX_IMAGE_SIZE),
        "Image size should not be more than 4mb."
      )
      .refine(
        (files) =>
          Array.from(files).every((file) =>
            ALLOWED_IMAGE_TYPES.includes(file.type)
          ),
        "Only these formats are allowed .jpg, .jpeg, .png, and .webp"
      ),
  ]),
});

type BillboardsFormValues = z.infer<typeof formSchema>;

const BillboardsForm: React.FC<BillboardsFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [billboardImage, setBillboardImage] = useState<string | null>(null);

  const title = initialData ? "Edit billboard" : "New billboard";
  const description = initialData
    ? "Edit billboard details"
    : "Add a new billboard";
  const toastMessage = initialData
    ? "Billboard updated!"
    : "Billboard created!";
  const action = initialData ? "Save changes" : "Create billboard";

  const form = useForm<BillboardsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { label: "", imageUrl: undefined },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: BillboardsFormValues) => {
    try {
      const formData = new FormData();
      formData.append("label", values.label);

      if (values.imageUrl) {
        if (typeof values.imageUrl === "string") {
          formData.append("imageFile", values.imageUrl);
        } else {
          formData.append("imageUrl", values.imageUrl[0]);
        }
      }

      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/billboards/${params.billboardId}`,
          formData
        );
      } else {
        await axios.post(`/api/${params.storeId}/billboards`, formData);
      }
      router.refresh();
      router.push(`/${params.storeId}/billboards`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/billboards/${params.billboardId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/billboards`);
      toast.success("Billboard deleted");
    } catch (error) {
      toast.error("Are you sure? This will remove all categories!");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  function getImageData(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return { files: null, displayUrl: null };
    }

    const file = files[0];

    if (!file) {
      return { files: null, displayUrl: null };
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const displayUrl = URL.createObjectURL(file);

    setBillboardImage(displayUrl);

    return { files: dataTransfer.files, displayUrl };
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
            disabled={loading}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-fit"
        >
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field: { onChange } }) => (
              <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                  <div className="w-72 h-52">
                    <ImageUploadComponent
                      isLoading={isLoading}
                      billboardImage={
                        billboardImage || initialData?.imageUrl || undefined
                      }
                      onImageChange={(event) => {
                        const { files } = getImageData(event);
                        onChange(files);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Billboard label"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="ml-auto">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default BillboardsForm;
