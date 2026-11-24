import { NextRequest, NextResponse } from "next/server";
import { processCronReminders } from "@/lib/cronReminders";

async function handleCron(request: NextRequest) {
  try {
    const expectedSecret = process.env.CRON_SECRET;

    // Never allow cron execution without a configured secret
    if (!expectedSecret) {
      console.error("CRON_SECRET is not configured");

      return NextResponse.json(
        { message: "Cron authentication is not configured" },
        { status: 500 },
      );
    }

    const authHeader = request.headers.get("authorization");

    // Require Bearer token authentication
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { message: "Unauthorized cron request" },
        { status: 401 },
      );
    }

    const summary = await processCronReminders();

    return NextResponse.json({
      success: true,
      message: "Cron reminders processed successfully",
      summary,
    });
  } catch (error) {
    console.error("[MindVault Cron API] Execution error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Cron execution failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}
