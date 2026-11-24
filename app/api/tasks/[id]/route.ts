import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Task from "@/models/TopicTask";
import { getUserId } from "@/lib/getUserId";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// UPDATE TASK
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
    }

    await connectDB();

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 200
      ) {
        return NextResponse.json(
          { message: "Invalid task title" },
          { status: 400 },
        );
      }

      updates.title = body.title.trim();
    }

    if (body.isCompleted !== undefined) {
      if (typeof body.isCompleted !== "boolean") {
        return NextResponse.json(
          { message: "Invalid completion status" },
          { status: 400 },
        );
      }

      updates.isCompleted = body.isCompleted;
      updates.completedAt = body.isCompleted ? new Date() : null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return NextResponse.json(
      { message: "Failed to update task" },
      { status: 500 },
    );
  }
}

// DELETE TASK
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
    }

    await connectDB();

    const task = await Task.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return NextResponse.json(
      { message: "Failed to delete task" },
      { status: 500 },
    );
  }
}
