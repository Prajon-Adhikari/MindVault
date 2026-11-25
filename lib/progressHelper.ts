export type TopicProgressResult = {
  progress: number;
  taskPercentage: number;
  timePercentage: number;
  totalTasks: number;
  completedTasks: number;
  daysLeft: number | null;
  isOverdue: boolean;
  statusText: string;
  badgeType: "completed" | "overdue" | "normal" | "no_deadline";
};

/**
 * Calculates topic progress based on deadline timeline and checklist completion.
 */
export function calculateTopicProgress(
  createdAt: string | Date,
  deadline: string | Date | null,
  totalTasks: number = 0,
  completedTasks: number = 0,
): TopicProgressResult {
  const hasTasks = totalTasks > 0;
  const taskPercentage = hasTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  let timePercentage = 0;
  let daysLeft: number | null = null;
  let isOverdue = false;
  let statusText = "";
  let badgeType: "completed" | "overdue" | "normal" | "no_deadline" =
    "no_deadline";

  if (deadline) {
    const created = new Date(createdAt).getTime();
    const target = new Date(deadline).getTime();
    const now = new Date().getTime();

    const totalDuration = target - created;
    const elapsed = now - created;

    if (totalDuration > 0) {
      timePercentage = Math.min(
        100,
        Math.max(0, Math.round((elapsed / totalDuration) * 100)),
      );
    } else {
      timePercentage = 100;
    }

    const diffMs = target - now;
    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      isOverdue = true;
      const positiveDays = Math.abs(daysLeft);
      statusText = `${positiveDays} ${positiveDays === 1 ? "day" : "days"} overdue`;
      badgeType = "overdue";
    } else if (daysLeft === 0) {
      statusText = "Due today";
      badgeType = "normal";
    } else {
      statusText = `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;
      badgeType = "normal";
    }
  }

  // Combined Progress:
  // If checklist tasks exist, checklist task completion is the primary progress measure.
  // If no checklist tasks exist yet, but a deadline is set, time elapsed percentage is used.
  let progress = 0;
  if (hasTasks) {
    progress = taskPercentage;
  } else if (deadline) {
    progress = timePercentage;
  } else {
    progress = 0;
  }

  if (hasTasks && taskPercentage === 100) {
    badgeType = "completed";
    statusText = "All tasks done";
  }

  return {
    progress,
    taskPercentage,
    timePercentage,
    totalTasks,
    completedTasks,
    daysLeft,
    isOverdue,
    statusText,
    badgeType,
  };
}
