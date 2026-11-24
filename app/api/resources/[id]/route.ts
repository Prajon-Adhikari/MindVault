import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Resource from "@/models/Resource";
import cloudinary from "@/lib/cloudinary";
import { getUserId } from "@/lib/getUserId";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid resource ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const updates: Record<string, string> = {};

    if (typeof body.title === "string") {
      if (!body.title.trim()) {
        return NextResponse.json(
          { message: "Title cannot be empty" },
          { status: 400 },
        );
      }

      updates.title = body.title.trim();
    }

    if (typeof body.description === "string") {
      updates.description = body.description.trim();
    }

    if (typeof body.content === "string") {
      updates.content = body.content;
    }

    if (typeof body.url === "string") {
      if (body.url && !/^https?:\/\//i.test(body.url)) {
        return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
      }

      updates.url = body.url;
    }

    await connectDB();

    const resource = await Resource.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Resource updated",
      resource,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update resource" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid resource ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const resource = await Resource.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 },
      );
    }

    if (resource.publicId) {
      const resourceType = resource.type === "video" ? "video" : "image";

      await cloudinary.uploader
        .destroy(resource.publicId, {
          resource_type: resourceType,
        })
        .catch((error) => {
          console.error("Cloudinary deletion error:", error);
        });
    }

    return NextResponse.json({
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to delete resource" },
      { status: 500 },
    );
  }
}
