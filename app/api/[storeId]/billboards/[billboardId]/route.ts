import { NextResponse } from "next/server";

import { put, del } from "@vercel/blob";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET(
  _req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    if (!params.billboardId)
      return new NextResponse("BillboardId is required", { status: 400 });

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.storeId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();
    const form = await req.formData();
    const label = form.get("label") as string;
    const imageUrl =
      (form.get("imageUrl") as string) || (form.get("imageFile") as File);

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    if (!label) return new NextResponse("Label is required", { status: 400 });

    if (!imageUrl)
      return new NextResponse("Image URL required", { status: 400 });

    if (!params.billboardId)
      return new NextResponse("Billboard Id is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (typeof imageUrl === "string") {
      const billboard = await prismadb.billboard.updateMany({
        where: {
          id: params.billboardId,
        },
        data: {
          label,
          imageUrl: imageUrl,
        },
      });

      return NextResponse.json(billboard);
    }

    const blob = await put(imageUrl.name, imageUrl, { access: "public" });

    const oldBillboardImage = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId,
      },
      select: {
        imageUrl: true,
      },
    });

    if (oldBillboardImage) await del(oldBillboardImage.imageUrl);

    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: params.billboardId,
      },
      data: {
        label,
        imageUrl: blob.url,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    if (!params.storeId)
      return new NextResponse("StoreId is required", { status: 400 });

    if (!params.billboardId)
      return new NextResponse("BillboardId is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 403 });

    const oldBillboardImage = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId,
      },
      select: {
        imageUrl: true,
      },
    });

    if (oldBillboardImage) await del(oldBillboardImage.imageUrl);

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
