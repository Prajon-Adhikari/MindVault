import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import DiaryNote from "@/models/DiaryNote";
import { getUserId } from "@/lib/getUserId";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET ALL DIARY NOTES FOR A TOPIC
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid topic ID" },
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
      return NextResponse.json({ message: "Topic not found" }, { status: 404 });
    }

    const diaryNotes = await DiaryNote.find({
      topicId: id,
      userId,
    }).sort({ entryDate: -1, createdAt: -1 });

    return NextResponse.json({ diaryNotes });
  } catch (error) {
    console.error("Get topic diary notes error:", error);

    return NextResponse.json(
      { message: "Failed to fetch diary notes" },
      { status: 500 },
    );
  }
}

// CREATE DIARY NOTE
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid topic ID" },
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
      return NextResponse.json({ message: "Topic not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, content, entryDate, color } = body;

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { message: "Diary entry title is required" },
        { status: 400 },
      );
    }

    if (title.trim().length > 200) {
      return NextResponse.json(
        { message: "Title cannot exceed 200 characters" },
        { status: 400 },
      );
    }

    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { message: "Diary content is required" },
        { status: 400 },
      );
    }

    let parsedEntryDate = new Date();
    if (entryDate) {
      const d = new Date(entryDate);
      if (!Number.isNaN(d.getTime())) {
        parsedEntryDate = d;
      }
    }

    const selectedColor = typeof color === "string" && color.trim() ? color.trim() : "#8B5CF6";

    const note = await DiaryNote.create({
      userId,
      topicId: id,
      title: title.trim(),
      content: content.trim(),
      entryDate: parsedEntryDate,
      color: selectedColor,
    });

    return NextResponse.json(
      {
        message: "Diary entry created successfully",
        note,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create diary note error:", error);

    return NextResponse.json(
      { message: "Failed to create diary entry" },
      { status: 500 },
    );
  }
}
