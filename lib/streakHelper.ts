/**
 * Calculates current and longest streak given an array of completed date strings ("YYYY-MM-DD")
 * and the target date (defaults to today's date string).
 */
export function calculateStreak(
  completedDates: string[] = [],
  todayStr: string = getTodayDateString(),
) {
  const datesSet = new Set(completedDates);

  const isCompletedToday = datesSet.has(todayStr);

  const formatDateString = (d: Date) => d.toISOString().split("T")[0];

  // Current streak calculation
  let currentStreak = 0;
  let checkDate = new Date(todayStr + "T00:00:00Z");

  // If not completed today yet, check starting from yesterday to preserve active streak today
  if (!isCompletedToday) {
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
  }

  while (true) {
    const dStr = formatDateString(checkDate);
    if (datesSet.has(dStr)) {
      currentStreak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak calculation
  const sortedDates = Array.from(datesSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevTime: number | null = null;

  for (const dateStr of sortedDates) {
    const currentDate = new Date(dateStr + "T00:00:00Z");
    const currentTime = currentDate.getTime();

    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round(
        (currentTime - prevTime) / (1000 * 3600 * 24),
      );
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    prevTime = currentTime;
  }

  return {
    isCompletedToday,
    currentStreak,
    longestStreak,
  };
}

/**
 * Gets date string formatted as "YYYY-MM-DD" for a given date in specified timezone
 */
export function getTodayDateString(
  date = new Date(),
  timezone = "Asia/Kathmandu",
) {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const parts = formatter.formatToParts(date);
    const map: Record<string, string> = {};
    for (const p of parts) {
      if (p.type !== "literal") {
        map[p.type] = p.value;
      }
    }

    return `${map.year}-${map.month}-${map.day}`;
  } catch {
    return date.toISOString().split("T")[0];
  }
}
