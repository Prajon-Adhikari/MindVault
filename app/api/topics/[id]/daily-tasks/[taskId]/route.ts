import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import DailyTask from "@/models/DailyTask";
import { getUserId } from "@/lib/getUserId";
import { calculateStreak, getTodayDateString } from "@/lib/streakHelper";

type RouteParams = {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
};

// UPDATE DAILY TASK (Title edit or toggle completion for a date)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, taskId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(taskId)
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

    const task = await DailyTask.findOne({
      _id: taskId,
      topicId: id,
      userId,
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const todayStr = getTodayDateString(new Date(), topic.timezone || "Asia/Kathmandu");
    const targetDate = typeof body.date === "string" && body.date.trim() ? body.date.trim() : todayStr;

    // Title update
    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 200
      ) {
        return NextResponse.json(
          { message: "Invalid daily task title" },
          { status: 400 },
        );
      }

      task.title = body.title.trim();
    }

    // Toggle or set completion status for target date
    if (body.isCompletedToday !== undefined || body.isCompleted !== undefined) {
      const shouldBeCompleted =
        body.isCompletedToday !== undefined
          ? Boolean(body.isCompletedToday)
          : Boolean(body.isCompleted);

      const dates = new Set<string>(task.completedDates || []);

      if (shouldBeCompleted) {
        dates.add(targetDate);
      } else {
        dates.delete(targetDate);
      }

      task.completedDates = Array.from(dates);
    }

    await task.save();

    const streakInfo = calculateStreak(task.completedDates, todayStr);

    return NextResponse.json({
      message: "Daily task updated successfully",
      task: {
        _id: task._id.toString(),
        title: task.title,
        completedDates: task.completedDates,
        isCompletedToday: streakInfo.isCompletedToday,
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    console.error("Update daily task error:", error);

    return NextResponse.json(
      { message: "Failed to update daily task" },
      { status: 500 },
    );
  }
}

// DELETE DAILY TASK
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, taskId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(taskId)
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

    const task = await DailyTask.findOneAndDelete({
      _id: taskId,
      topicId: id,
      userId,
    });

    if (!task) {
      return NextResponse.json({ message: "Daily task not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Daily task deleted successfully",
    });
  } catch (error) {
    console.error("Delete daily task error:", error);

    return NextResponse.json(
      { message: "Failed to delete daily task" },
      { status: 500 },
    );
  }
}
