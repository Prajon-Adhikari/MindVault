import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import TopicTask from "@/models/TopicTask";
import { getUserId } from "@/lib/getUserId";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET ALL TASKS FOR A TOPIC
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

    const tasks = await TopicTask.find({
      topicId: id,
      userId,
    }).sort({ position: 1, createdAt: 1 });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Get topic tasks error:", error);

    return NextResponse.json(
      { message: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

// CREATE TASK
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
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { message: "Task title is required" },
        { status: 400 },
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { message: "Task title cannot exceed 200 characters" },
        { status: 400 },
      );
    }

    const position = await TopicTask.countDocuments({
      topicId: id,
      userId,
    });

    const task = await TopicTask.create({
      userId,
      topicId: id,
      title,
      position,
    });

    return NextResponse.json(
      {
        message: "Task created successfully",
        task,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create topic task error:", error);

    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 },
    );
  }
}
