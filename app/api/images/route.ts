import { NextResponse } from "next/server";

import { put } from "@vercel/blob";
import { del } from "@vercel/blob";
import { auth } from "@clerk/nextjs";
import { url } from "inspector";

export async function POST(request: Request): Promise<NextResponse> {
  const { userId } = auth();

  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (filename === null) {
    return new NextResponse("Bad Request: Missing filename", { status: 400 });
  }

  if (request.body === null) {
    return new NextResponse("Bad Request: Missing request body", {
      status: 400,
    });
  }

  const blob = await put(filename, request.body, {
    access: "public",
  });

  return NextResponse.json(blob);
}

export async function DELETE(request: Request) {
  const { userId } = auth();

  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const urlToDelete = searchParams.get("url") as string;

  await del(urlToDelete);

  return new Response();
}
