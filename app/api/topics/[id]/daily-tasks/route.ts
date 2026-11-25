import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import DailyTask from "@/models/DailyTask";
import { getUserId } from "@/lib/getUserId";
import { calculateStreak, getTodayDateString } from "@/lib/streakHelper";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET ALL DAILY TASKS FOR A TOPIC
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

    const todayStr = getTodayDateString(new Date(), topic.timezone || "Asia/Kathmandu");

    const rawTasks = await DailyTask.find({
      topicId: id,
      userId,
    }).sort({ position: 1, createdAt: 1 });

    const tasks = rawTasks.map((task) => {
      const completedDates: string[] = task.completedDates || [];
      const streakInfo = calculateStreak(completedDates, todayStr);

      return {
        _id: task._id.toString(),
        title: task.title,
        completedDates,
        isCompletedToday: streakInfo.isCompletedToday,
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        createdAt: task.createdAt,
      };
    });

    // Calculate overall topic daily completion and streak stats
    const totalDailyTasksCount = tasks.length;
    const completedTodayCount = tasks.filter((t) => t.isCompletedToday).length;

    // Overall current streak across topic daily tasks:
    // A day is considered fully completed if all tasks were completed that day
    const dateCounts: Record<string, number> = {};
    if (totalDailyTasksCount > 0) {
      for (const t of rawTasks) {
        for (const dateStr of t.completedDates || []) {
          dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        }
      }
    }

    const fullyCompletedDates = Object.keys(dateCounts).filter(
      (dStr) => dateCounts[dStr] >= totalDailyTasksCount && totalDailyTasksCount > 0,
    );

    const overallStreakInfo = calculateStreak(fullyCompletedDates, todayStr);

    return NextResponse.json({
      todayStr,
      tasks,
      totalDailyTasksCount,
      completedTodayCount,
      overallCurrentStreak: overallStreakInfo.currentStreak,
      overallLongestStreak: overallStreakInfo.longestStreak,
      isFullyCompletedToday:
        totalDailyTasksCount > 0 && completedTodayCount === totalDailyTasksCount,
    });
  } catch (error) {
    console.error("Get topic daily tasks error:", error);

    return NextResponse.json(
      { message: "Failed to fetch daily tasks" },
      { status: 500 },
    );
  }
}

// CREATE DAILY TASK
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
        { message: "Daily task title is required" },
        { status: 400 },
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { message: "Daily task title cannot exceed 200 characters" },
        { status: 400 },
      );
    }

    const position = await DailyTask.countDocuments({
      topicId: id,
      userId,
    });

    const task = await DailyTask.create({
      userId,
      topicId: id,
      title,
      position,
      completedDates: [],
    });

    const todayStr = getTodayDateString(new Date(), topic.timezone || "Asia/Kathmandu");
    const streakInfo = calculateStreak([], todayStr);

    return NextResponse.json(
      {
        message: "Daily task created successfully",
        task: {
          _id: task._id.toString(),
          title: task.title,
          completedDates: [],
          isCompletedToday: false,
          currentStreak: streakInfo.currentStreak,
          longestStreak: streakInfo.longestStreak,
          createdAt: task.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create daily task error:", error);

    return NextResponse.json(
      { message: "Failed to create daily task" },
      { status: 500 },
    );
  }
}
