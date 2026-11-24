import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import User from "@/models/User";
import { sendPracticeReminder } from "@/lib/sendRemainder";

export interface CronTopicResult {
  topicId: string;
  topicName: string;
  status: "sent" | "skipped" | "error";
  reason?: string;
}

export interface CronExecutionSummary {
  timestamp: string;
  processedCount: number;
  sentCount: number;
  errorCount: number;
  results: CronTopicResult[];
}

/**
 * Formats a Date object into local date (YYYY-MM-DD) and local time (HH:mm)
 * for a specific IANA timezone string.
 */
export function getTimeInTimezone(timezone: string, date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const map: Record<string, string> = {};
    for (const p of parts) {
      if (p.type !== "literal") {
        map[p.type] = p.value;
      }
    }

    let hourStr = map.hour || "00";
    if (hourStr === "24") hourStr = "00";
    const minuteStr = map.minute || "00";

    const dateStr = `${map.year}-${map.month}-${map.day}`;
    const timeStr = `${hourStr.padStart(2, "0")}:${minuteStr.padStart(2, "0")}`;

    return { dateStr, timeStr };
  } catch {
    const isoStr = date.toISOString();
    const dateStr = isoStr.split("T")[0];
    const timeStr = isoStr.split("T")[1].slice(0, 5);
    return { dateStr, timeStr };
  }
}

/**
 * Main worker function to find due topic practice reminders and dispatch emails.
 */
export async function processCronReminders(): Promise<CronExecutionSummary> {
  await connectDB();

  // Query all non-archived topics that have email notifications enabled and a reminder time
  const topics = await Topic.find({
    notifyByEmail: true,
    isArchived: false,
    reminderTime: { $exists: true, $ne: "" },
  });

  const now = new Date();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let processedCount = 0;
  let sentCount = 0;
  let errorCount = 0;
  const results: CronTopicResult[] = [];

  for (const topic of topics) {
    processedCount++;

    const tz = topic.timezone || "Asia/Kathmandu";
    const { dateStr, timeStr } = getTimeInTimezone(tz, now);

    // Check if the current time in topic's timezone has reached the reminder time today
    if (timeStr < topic.reminderTime) {
      results.push({
        topicId: topic._id.toString(),
        topicName: topic.name,
        status: "skipped",
        reason: `Scheduled for ${topic.reminderTime} (${tz}), current time is ${timeStr}`,
      });
      continue;
    }

    // Check if already sent today
    if (topic.reminderLastSentFor === dateStr) {
      results.push({
        topicId: topic._id.toString(),
        topicName: topic.name,
        status: "skipped",
        reason: `Reminder already sent today (${dateStr})`,
      });
      continue;
    }

    // Atomically claim topic for dateStr to prevent duplicate processing
    const claimedTopic = await Topic.findOneAndUpdate(
      {
        _id: topic._id,
        reminderLastSentFor: { $ne: dateStr },
        reminderClaimedFor: { $ne: dateStr },
      },
      {
        $set: {
          reminderClaimedFor: dateStr,
          reminderClaimedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!claimedTopic) {
      results.push({
        topicId: topic._id.toString(),
        topicName: topic.name,
        status: "skipped",
        reason: `Topic was claimed or processed concurrently for ${dateStr}`,
      });
      continue;
    }

    // Fetch user details for recipient email and name
    const user = await User.findById(topic.userId);
    if (!user || !user.email) {
      results.push({
        topicId: topic._id.toString(),
        topicName: topic.name,
        status: "error",
        reason: "User not found or missing email address",
      });
      errorCount++;
      // Release claim
      await Topic.updateOne(
        { _id: topic._id },
        { $set: { reminderClaimedFor: "" } },
      );
      continue;
    }

    const topicUrl = `${baseUrl}/topics/${topic._id}`;

    try {
      await sendPracticeReminder(
        user.email,
        user.name,
        topic.name,
        topic.reminderTime,
        topicUrl,
      );

      // Successfully sent email - mark date as sent
      await Topic.updateOne(
        { _id: topic._id },
        {
          $set: {
            reminderLastSentFor: dateStr,
            reminderClaimedFor: dateStr,
          },
        },
      );

      sentCount++;
      results.push({
        topicId: topic._id.toString(),
        topicName: topic.name,
        status: "sent",
        reason: `Email sent to ${user.email} at ${timeStr} (${tz})`,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(
        `[MindVault Cron] Failed sending email for topic "${topic.name}" (${topic._id}):`,
        err,
      );
      errorCount++;

      // Release claim on failure so it can retry
      await Topic.updateOne(
        { _id: topic._id },
        { $set: { reminderClaimedFor: "" } },
      );

      results.push({
        topicId: topic._id.toString(),
        topicName: topic.name,
        status: "error",
        reason: errorMessage,
      });
    }
  }

  return {
    timestamp: now.toISOString(),
    processedCount,
    sentCount,
    errorCount,
    results,
  };
}
