import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import Resource from "@/models/Resource";
import cloudinary from "@/lib/cloudinary";
import { getUserId } from "@/lib/getUserId";

type Props = {
  params: Promise<{ id: string }>;
};

const allowedTypes = ["note", "link", "image", "file", "video"];

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid folder ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const topic = await Topic.findOne({
      _id: id,
      userId,
      isArchived: false,
    });

    if (!topic) {
      return NextResponse.json(
        { message: "Folder not found" },
        { status: 404 },
      );
    }

    const resources = await Resource.find({
      topicId: id,
      userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch resources" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  let uploadedPublicId = "";

  try {
    const userId = await getUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid folder ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const topic = await Topic.findOne({
      _id: id,
      userId,
      isArchived: false,
    });

    if (!topic) {
      return NextResponse.json(
        { message: "Folder not found" },
        { status: 404 },
      );
    }

    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const type = String(formData.get("type") || "");
    const description = String(formData.get("description") || "").trim();

    const content = String(formData.get("content") || "");
    const url = String(formData.get("url") || "");

    if (!title || title.length > 200 || !allowedTypes.includes(type)) {
      return NextResponse.json(
        { message: "Valid title and resource type are required" },
        { status: 400 },
      );
    }

    let fileUrl = "";
    let fileName = "";
    let fileSize = 0;
    let mimeType = "";
    let publicId = "";

    const file = formData.get("file");

    if (file instanceof File && file.size > 0) {
      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        return NextResponse.json(
          { message: "File size must be 10 MB or less" },
          { status: 400 },
        );
      }

      if (type !== "image" && type !== "file" && type !== "video") {
        return NextResponse.json(
          { message: "This resource type cannot contain a file" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await new Promise<any>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: "mindvault/resources",
            resource_type: "auto",
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        upload.end(buffer);
      });

      fileUrl = result.secure_url;
      publicId = result.public_id;
      uploadedPublicId = result.public_id;
      fileName = file.name;
      fileSize = file.size;
      mimeType = file.type;
    }

    if ((type === "image" || type === "file" || type === "video") && !fileUrl) {
      return NextResponse.json(
        { message: "Please select a file to upload" },
        { status: 400 },
      );
    }

    if (
      (type === "link" || type === "video") &&
      url &&
      !/^https?:\/\//i.test(url)
    ) {
      return NextResponse.json(
        { message: "Please provide a valid URL" },
        { status: 400 },
      );
    }

    if (type === "link" && !url) {
      return NextResponse.json(
        { message: "A URL is required" },
        { status: 400 },
      );
    }

    if (type === "note" && !content.trim()) {
      return NextResponse.json(
        { message: "Note content is required" },
        { status: 400 },
      );
    }

    const resource = await Resource.create({
      userId,
      topicId: id,
      title,
      description,
      type,
      content: type === "note" ? content : "",
      url: type === "link" || type === "video" ? url : "",
      fileUrl,
      publicId,
      fileName,
      fileSize,
      mimeType,
    });

    return NextResponse.json(
      {
        message: "Resource saved successfully",
        resource,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create resource error:", error);

    // Avoid leaving an uploaded file behind if database creation fails.
    if (uploadedPublicId) {
      await cloudinary.uploader
        .destroy(uploadedPublicId, {
          resource_type: "image",
        })
        .catch(() => undefined);
    }

    return NextResponse.json(
      { message: "Failed to save resource" },
      { status: 500 },
    );
  }
}
