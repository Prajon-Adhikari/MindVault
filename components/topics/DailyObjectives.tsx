"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Target,
  Loader2,
  CircleCheck,
  Circle,
  Save,
  Trophy,
  Calendar,
} from "lucide-react";

type DailyTask = {
  _id: string;
  title: string;
  completedDates: string[];
  isCompletedToday: boolean;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
};

type Props = {
  topicId: string;
};

export default function DailyObjectives({ topicId }: Props) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newTask, setNewTask] = useState("");

  const [overallStreak, setOverallStreak] = useState(0);
  const [overallLongestStreak, setOverallLongestStreak] = useState(0);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState("");

  const completedTodayCount = tasks.filter((task) => task.isCompletedToday).length;
  const totalTasks = tasks.length;
  const remainingTasks = totalTasks - completedTodayCount;

  const progress =
    totalTasks > 0 ? Math.round((completedTodayCount / totalTasks) * 100) : 0;

  // Fetch daily tasks
  async function fetchDailyTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/topics/${topicId}/daily-tasks`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load daily tasks");
      }

      setTasks(data.tasks || []);
      setOverallStreak(data.overallCurrentStreak || 0);
      setOverallLongestStreak(data.overallLongestStreak || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDailyTasks();
  }, [topicId]);

  // Add daily task
  async function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newTask.trim()) return;

    try {
      setAdding(true);
      setError("");

      const response = await fetch(`/api/topics/${topicId}/daily-tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add daily task");
      }

      setTasks((prev) => [...prev, data.task]);
      setNewTask("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add daily task");
    } finally {
      setAdding(false);
    }
  }

  // Toggle completion for today
  async function handleToggleToday(task: DailyTask) {
    const nextStatus = !task.isCompletedToday;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((item) => {
        if (item._id !== task._id) return item;
        const newStreak = nextStatus
          ? item.currentStreak + 1
          : Math.max(0, item.currentStreak - 1);
        return {
          ...item,
          isCompletedToday: nextStatus,
          currentStreak: newStreak,
          longestStreak: Math.max(item.longestStreak, newStreak),
        };
      }),
    );

    try {
      const response = await fetch(
        `/api/topics/${topicId}/daily-tasks/${task._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isCompletedToday: nextStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update daily task");
      }

      setTasks((prev) =>
        prev.map((item) => (item._id === task._id ? data.task : item)),
      );

      // Re-fetch overall topic stats
      const statsRes = await fetch(`/api/topics/${topicId}/daily-tasks`);
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setOverallStreak(statsData.overallCurrentStreak || 0);
        setOverallLongestStreak(statsData.overallLongestStreak || 0);
      }
    } catch (err) {
      // Revert optimism if failed
      setTasks((prev) =>
        prev.map((item) => (item._id === task._id ? task : item)),
      );
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  // Start editing
  function startEditing(task: DailyTask) {
    setEditingId(task._id);
    setEditingTitle(task.title);
    setError("");
  }

  // Edit task title
  async function handleEdit(taskId: string) {
    if (!editingTitle.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      const response = await fetch(
        `/api/topics/${topicId}/daily-tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editingTitle.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update daily task");
      }

      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? data.task : task)),
      );

      setEditingId(null);
      setEditingTitle("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update daily task");
    }
  }

  // Delete task
  async function handleDelete(taskId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this daily objective?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/topics/${topicId}/daily-tasks/${taskId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete daily task");
      }

      setTasks((prev) => prev.filter((task) => task._id !== taskId));

      if (editingId === taskId) {
        setEditingId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete daily task");
    }
  }

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Flame size={24} className="animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">Daily Objectives</h2>
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                <Calendar size={12} />
                {todayFormatted}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Tasks reset status daily & track your consistency streak
            </p>
          </div>
        </div>

        {/* Overall streak counters - Vertically stacked */}
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <div className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-1.5 text-orange-700">
            <Flame size={16} className="fill-orange-500 text-orange-500" />
            <span className="text-sm font-bold">{overallStreak}</span>
            <span className="text-xs font-medium">day streak</span>
          </div>

          {overallLongestStreak > 0 && (
            <div
              title="Longest streak recorded for this topic"
              className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 border border-amber-200"
            >
              <Trophy size={14} />
              <span>Best: {overallLongestStreak}d</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Progress Bar */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Today&apos;s goal progress</span>
          <span className="font-semibold text-slate-900">{progress}%</span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CircleCheck size={14} className="text-emerald-600" />
            {completedTodayCount} done today
          </span>

          <span className="flex items-center gap-1.5">
            <Circle size={14} />
            {remainingTasks} remaining today
          </span>
        </div>
      </div>

      {/* Add Daily Task Form */}
      <form onSubmit={handleAddTask} className="mt-6 flex gap-2">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Set a daily objective (e.g. Learn 5 new words)..."
          maxLength={200}
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-800"
        />

        <button
          type="submit"
          disabled={adding || !newTask.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? (
            <Loader2 size={17} className="animate-spin text-amber-400" />
          ) : (
            <Plus size={17} className="text-amber-400" />
          )}

          <span className="hidden sm:inline">Add task</span>
        </button>
      </form>

      {/* Error display */}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Tasks List */}
      <div className="mt-5 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
            <Target size={30} className="mx-auto text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No daily objectives configured
            </p>

            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Add persistent daily tasks like &quot;Learn 5 new words&quot; or &quot;Read 10 pages&quot;.
              Check them off every day to build your streak!
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`group flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
                task.isCompletedToday
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              {/* Today's completion Checkbox */}
              <button
                type="button"
                onClick={() => handleToggleToday(task)}
                title={
                  task.isCompletedToday
                    ? "Mark as uncompleted for today"
                    : "Mark as completed for today"
                }
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                  task.isCompletedToday
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 hover:border-orange-500"
                }`}
              >
                {task.isCompletedToday && <Check size={14} />}
              </button>

              {/* Task title or edit input */}
              {editingId === task._id ? (
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEdit(task._id);
                    }

                    if (e.key === "Escape") {
                      setEditingId(null);
                    }
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-orange-500"
                />
              ) : (
                <span
                  className={`min-w-0 flex-1 text-sm font-medium ${
                    task.isCompletedToday
                      ? "text-slate-500 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {task.title}
                </span>
              )}

              {/* Individual task streak badge */}
              <div
                title={`${task.currentStreak} day streak (Best: ${task.longestStreak}d)`}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                  task.currentStreak > 0
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Flame
                  size={13}
                  className={task.currentStreak > 0 ? "fill-orange-500 text-orange-500" : ""}
                />
                <span>{task.currentStreak}d</span>
              </div>

              {/* Actions */}
              {editingId === task._id ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(task._id)}
                    title="Save title"
                    className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Save size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    title="Cancel"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => startEditing(task)}
                    title="Edit objective title"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(task._id)}
                    title="Delete daily objective"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Completion message */}
      {!loading && totalTasks > 0 && progress === 100 && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800 font-medium">
          <CircleCheck size={18} className="text-emerald-600" />
          Awesome work! You completed all daily objectives for today. Your streak is alive! 🔥
        </div>
      )}
    </section>
  );
}
