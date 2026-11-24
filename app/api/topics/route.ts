import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import { getUserId } from "@/lib/getUserId";

const validPriorities = ["low", "medium", "high"];

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const topics = await Topic.find({
      userId,
      isArchived: false,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Get topics error:", error);

    return NextResponse.json(
      { message: "Failed to fetch topics" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    const {
      name,
      description,
      color,
      icon,
      priority,
      deadline,
      reminderTime = "",
      timezone = "Asia/Kathmandu",
      notifyByEmail = false,
    } = body;

    // Validate topic name
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { message: "Topic name is required" },
        { status: 400 },
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { message: "Topic name cannot exceed 100 characters" },
        { status: 400 },
      );
    }

    // Validate description
    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json(
        { message: "Invalid description" },
        { status: 400 },
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { message: "Description cannot exceed 500 characters" },
        { status: 400 },
      );
    }

    // Validate priority
    const selectedPriority = priority || "medium";

    if (!validPriorities.includes(selectedPriority)) {
      return NextResponse.json(
        { message: "Invalid priority" },
        { status: 400 },
      );
    }

    // Validate deadline independently
    let parsedDeadline: Date | null = null;

    if (deadline) {
      parsedDeadline = new Date(deadline);

      if (Number.isNaN(parsedDeadline.getTime())) {
        return NextResponse.json(
          { message: "Invalid deadline" },
          { status: 400 },
        );
      }
    }

    // Validate daily reminder time
    if (
      typeof reminderTime !== "string" ||
      (reminderTime !== "" && !TIME_REGEX.test(reminderTime))
    ) {
      return NextResponse.json(
        { message: "Invalid reminder time. Use HH:mm format." },
        { status: 400 },
      );
    }

    // Validate timezone
    if (
      typeof timezone !== "string" ||
      !timezone.trim() ||
      timezone.length > 100
    ) {
      return NextResponse.json(
        { message: "Invalid timezone" },
        { status: 400 },
      );
    }

    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
      });
    } catch {
      return NextResponse.json(
        { message: "Invalid timezone" },
        { status: 400 },
      );
    }

    // Validate email notification setting
    if (typeof notifyByEmail !== "boolean") {
      return NextResponse.json(
        { message: "Invalid email notification setting" },
        { status: 400 },
      );
    }

    // Email reminders require a selected daily reminder time
    const emailNotification = reminderTime ? notifyByEmail : false;

    const topic = await Topic.create({
      userId,
      name: name.trim(),
      description: description?.trim() || "",
      color: color || "#D4A373",
      icon: icon || "folder",
      priority: selectedPriority,
      deadline: parsedDeadline,

      // Daily reminder configuration
      reminderTime,
      timezone,
      notifyByEmail: emailNotification,

      // Used to prevent duplicate daily emails
      reminderLastSentFor: "",
    });

    return NextResponse.json(
      {
        message: "Topic created successfully",
        topic,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create topic error:", error);

    return NextResponse.json(
      { message: "Failed to create topic" },
      { status: 500 },
    );
  }
}
