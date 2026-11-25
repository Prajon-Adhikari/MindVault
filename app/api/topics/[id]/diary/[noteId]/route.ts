import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import DiaryNote from "@/models/DiaryNote";
import { getUserId } from "@/lib/getUserId";

type RouteParams = {
  params: Promise<{
    id: string;
    noteId: string;
  }>;
};

// UPDATE DIARY NOTE
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, noteId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(noteId)
    ) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
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
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 200
      ) {
        return NextResponse.json(
          { message: "Invalid title" },
          { status: 400 },
        );
      }
      updates.title = body.title.trim();
    }

    if (body.content !== undefined) {
      if (typeof body.content !== "string" || !body.content.trim()) {
        return NextResponse.json(
          { message: "Invalid diary content" },
          { status: 400 },
        );
      }
      updates.content = body.content.trim();
    }

    if (body.entryDate !== undefined) {
      const d = new Date(body.entryDate);
      if (!Number.isNaN(d.getTime())) {
        updates.entryDate = d;
      }
    }

    if (body.color !== undefined) {
      if (typeof body.color === "string" && body.color.trim()) {
        updates.color = body.color.trim();
      }
    }

    const note = await DiaryNote.findOneAndUpdate(
      {
        _id: noteId,
        topicId: id,
        userId,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!note) {
      return NextResponse.json({ message: "Diary entry not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Diary entry updated successfully",
      note,
    });
  } catch (error) {
    console.error("Update diary note error:", error);

    return NextResponse.json(
      { message: "Failed to update diary entry" },
      { status: 500 },
    );
  }
}

// DELETE DIARY NOTE
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, noteId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(noteId)
    ) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
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

    const note = await DiaryNote.findOneAndDelete({
      _id: noteId,
      topicId: id,
      userId,
    });

    if (!note) {
      return NextResponse.json({ message: "Diary entry not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Diary entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete diary note error:", error);

    return NextResponse.json(
      { message: "Failed to delete diary entry" },
      { status: 500 },
    );
  }
}
