import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import { getUserId } from "@/lib/getUserId";

type RouteParams = {
  params: Promise<{ id: string }>;
};

const validPriorities = ["low", "medium", "high"];

// GET SINGLE TOPIC
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

    return NextResponse.json({ topic });
  } catch (error) {
    console.error("Get topic error:", error);

    return NextResponse.json(
      { message: "Failed to fetch topic" },
      { status: 500 },
    );
  }
}

// UPDATE TOPIC
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();

    const updates: Record<string, unknown> = {};

    // Name
    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.trim().length > 100
      ) {
        return NextResponse.json(
          { message: "Please provide a valid topic name" },
          { status: 400 },
        );
      }

      updates.name = body.name.trim();
    }

    // Description
    if (body.description !== undefined) {
      if (typeof body.description !== "string") {
        return NextResponse.json(
          { message: "Invalid description" },
          { status: 400 },
        );
      }

      updates.description = body.description.trim();
    }

    // Color
    if (body.color !== undefined) {
      if (typeof body.color !== "string") {
        return NextResponse.json({ message: "Invalid color" }, { status: 400 });
      }

      updates.color = body.color;
    }

    // Icon
    if (body.icon !== undefined) {
      updates.icon = body.icon;
    }

    // Priority
    if (body.priority !== undefined) {
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json(
          { message: "Invalid priority" },
          { status: 400 },
        );
      }

      updates.priority = body.priority;
    }

    // Deadline
    if (body.deadline !== undefined) {
      let parsedDeadline: Date | null = null;

      if (body.deadline) {
        parsedDeadline = new Date(body.deadline);

        if (Number.isNaN(parsedDeadline.getTime())) {
          return NextResponse.json(
            { message: "Invalid deadline" },
            { status: 400 },
          );
        }
      }

      updates.deadline = parsedDeadline;

      // Reset reminder when deadline changes
      updates.reminderSentAt = null;
    }

    const existingTopic = await Topic.findOne({
      _id: id,
      userId,
      isArchived: false,
    });

    if (!existingTopic) {
      return NextResponse.json({ message: "Topic not found" }, { status: 404 });
    }

    const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

    // Reminder time
    if (body.reminderTime !== undefined) {
      if (
        typeof body.reminderTime !== "string" ||
        (body.reminderTime !== "" && !TIME_REGEX.test(body.reminderTime))
      ) {
        return NextResponse.json(
          { message: "Invalid reminder time. Use HH:mm format." },
          { status: 400 },
        );
      }

      updates.reminderTime = body.reminderTime;
      updates.reminderLastSentFor = "";
    }

    // Timezone
    if (body.timezone !== undefined) {
      if (
        typeof body.timezone !== "string" ||
        !body.timezone.trim() ||
        body.timezone.length > 100
      ) {
        return NextResponse.json(
          { message: "Invalid timezone" },
          { status: 400 },
        );
      }

      try {
        new Intl.DateTimeFormat("en-US", {
          timeZone: body.timezone,
        });
      } catch {
        return NextResponse.json(
          { message: "Invalid timezone" },
          { status: 400 },
        );
      }

      updates.timezone = body.timezone;
    }

    // Email notification
    if (body.notifyByEmail !== undefined) {
      if (typeof body.notifyByEmail !== "boolean") {
        return NextResponse.json(
          { message: "Invalid notification preference" },
          { status: 400 },
        );
      }

      updates.notifyByEmail = body.notifyByEmail;
    }

    const finalReminderTime =
      updates.reminderTime !== undefined
        ? (updates.reminderTime as string)
        : (existingTopic.reminderTime as string);

    const requestedNotification =
      updates.notifyByEmail !== undefined
        ? (updates.notifyByEmail as boolean)
        : (existingTopic.notifyByEmail as boolean);

    if (requestedNotification && !finalReminderTime) {
      return NextResponse.json(
        { message: "Please select a daily reminder time first" },
        { status: 400 },
      );
    }

    updates.notifyByEmail = finalReminderTime ? requestedNotification : false;

    if (
      updates.reminderTime !== undefined ||
      updates.notifyByEmail !== undefined
    ) {
      updates.reminderLastSentFor = "";
    }

    const topic = await Topic.findOneAndUpdate(
      {
        _id: id,
        userId,
        isArchived: false,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return NextResponse.json({
      message: "Topic updated successfully",
      topic,
    });
  } catch (error) {
    console.error("Update topic error:", error);

    return NextResponse.json(
      { message: "Failed to update topic" },
      { status: 500 },
    );
  }
}

// DELETE / ARCHIVE TOPIC
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const topic = await Topic.findOneAndUpdate(
      {
        _id: id,
        userId,
        isArchived: false,
      },
      {
        $set: {
          isArchived: true,
          notifyByEmail: false,
        },
      },
      { new: true },
    );

    if (!topic) {
      return NextResponse.json({ message: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Topic archived successfully",
    });
  } catch (error) {
    console.error("Archive topic error:", error);

    return NextResponse.json(
      { message: "Failed to archive topic" },
      { status: 500 },
    );
  }
}
