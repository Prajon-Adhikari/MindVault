import { NextRequest, NextResponse } from "next/server";
import { processCronReminders } from "@/lib/cronReminders";

export async function GET(request: NextRequest) {
  try {
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { message: "CRON_SECRET is not configured" },
        { status: 500 },
      );
    }

    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const summary = await processCronReminders();

    return NextResponse.json({
      success: true,
      message: "Reminders processed successfully",
      summary,
    });
  } catch (error) {
    console.error("Cron error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Cron execution failed",
      },
      { status: 500 },
    );
  }
}
