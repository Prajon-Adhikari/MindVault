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

    // Email notification
    if (body.notifyByEmail !== undefined) {
      if (typeof body.notifyByEmail !== "boolean") {
        return NextResponse.json(
          { message: "Invalid notification preference" },
          { status: 400 },
        );
      }

      updates.notifyByEmail = body.notifyByEmail;

      if (body.notifyByEmail) {
        updates.reminderSentAt = null;
      }
    }

    // Ensure an email reminder has a deadline
    const existingTopic = await Topic.findOne({
      _id: id,
      userId,
      isArchived: false,
    });

    if (!existingTopic) {
      return NextResponse.json({ message: "Topic not found" }, { status: 404 });
    }

    const finalDeadline =
      updates.deadline !== undefined
        ? updates.deadline
        : existingTopic.deadline;

    const finalNotification =
      updates.notifyByEmail !== undefined
        ? updates.notifyByEmail
        : existingTopic.notifyByEmail;

    if (finalNotification && !finalDeadline) {
      return NextResponse.json(
        {
          message: "Set a deadline before enabling email reminders",
        },
        { status: 400 },
      );
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
