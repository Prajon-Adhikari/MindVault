import { NextRequest, NextResponse } from "next/server";
import { processCronReminders } from "@/lib/cronReminders";

export async function GET(request: NextRequest) {
  try {
    console.log("I am here");
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get("secret");

    const expectedSecret = process.env.CRON_SECRET;

    // Enforce secret check if CRON_SECRET is configured in environment
    if (expectedSecret) {
      const isHeaderValid = authHeader === `Bearer ${expectedSecret}`;
      const isQueryValid = querySecret === expectedSecret;

      if (!isHeaderValid && !isQueryValid) {
        return NextResponse.json(
          { message: "Unauthorized cron request" },
          { status: 401 },
        );
      }
    }

    const summary = await processCronReminders();

    return NextResponse.json({
      message: "Cron reminders processed successfully",
      summary,
    });
  } catch (error) {
    console.error("[MindVault Cron API] Execution error:", error);

    return NextResponse.json(
      {
        message: "Cron execution failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
