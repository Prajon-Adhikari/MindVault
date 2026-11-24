import { processCronReminders } from "@/lib/cronReminders";

let isRunning = false;
let timer: NodeJS.Timeout | null = null;

export function startCronScheduler() {
  if (timer) return; // Prevent multiple timers

  console.log("[MindVault Cron] Background reminder scheduler active (checking every 60s)");

  timer = setInterval(async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await processCronReminders();
    } catch (err) {
      console.error("[MindVault Cron] Background execution error:", err);
    } finally {
      isRunning = false;
    }
  }, 60000);
}
