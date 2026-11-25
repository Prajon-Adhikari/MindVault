"use client";

import { useEffect, useState } from "react";

import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ListTodo,
  Loader2,
  CircleCheck,
  Circle,
  Save,
} from "lucide-react";

type TopicTask = {
  _id: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
};

type Props = {
  topicId: string;
};

export default function TopicChecklist({ topicId }: Props) {
  const [tasks, setTasks] = useState<TopicTask[]>([]);
  const [newTask, setNewTask] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState("");

  const completedTasks = tasks.filter((task) => task.isCompleted).length;

  const totalTasks = tasks.length;
  const remainingTasks = totalTasks - completedTasks;

  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Fetch tasks
  async function fetchTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/topics/${topicId}/tasks`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tasks");
      }

      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, [topicId]);

  // Add task
  async function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newTask.trim()) return;

    try {
      setAdding(true);
      setError("");

      const response = await fetch(`/api/topics/${topicId}/tasks`, {
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
        throw new Error(data.message || "Failed to add task");
      }

      setTasks((previous) => [...previous, data.task]);
      setNewTask("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    } finally {
      setAdding(false);
    }
  }

  // Toggle completion
  async function handleToggle(task: TopicTask) {
    const updatedStatus = !task.isCompleted;

    // Optimistic UI update
    setTasks((previous) =>
      previous.map((item) =>
        item._id === task._id ? { ...item, isCompleted: updatedStatus } : item,
      ),
    );

    try {
      const response = await fetch(`/api/topics/${topicId}/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCompleted: updatedStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task");
      }

      setTasks((previous) =>
        previous.map((item) => (item._id === task._id ? data.task : item)),
      );
    } catch (err) {
      // Restore old status if request fails
      setTasks((previous) =>
        previous.map((item) =>
          item._id === task._id
            ? { ...item, isCompleted: task.isCompleted }
            : item,
        ),
      );

      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  }

  // Start editing
  function startEditing(task: TopicTask) {
    setEditingId(task._id);
    setEditingTitle(task.title);
    setError("");
  }

  // Save edited task
  async function handleEdit(taskId: string) {
    if (!editingTitle.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      const response = await fetch(`/api/topics/${topicId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingTitle.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task");
      }

      setTasks((previous) =>
        previous.map((task) => (task._id === taskId ? data.task : task)),
      );

      setEditingId(null);
      setEditingTitle("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  }

  // Delete task
  async function handleDelete(taskId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/topics/${topicId}/tasks/${taskId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      setTasks((previous) => previous.filter((task) => task._id !== taskId));

      if (editingId === taskId) {
        setEditingId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <ListTodo size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">Checklist</h2>

            <p className="text-xs text-slate-500">
              Organize and track your progress
            </p>
          </div>
        </div>

        <span className="text-sm font-medium text-slate-600">
          {completedTasks}/{totalTasks} completed
        </span>
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Overall progress
          </span>

          <span className="text-sm font-semibold text-slate-900">
            {progress}%
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CircleCheck size={14} className="text-emerald-600" />
            {completedTasks} completed
          </span>

          <span className="flex items-center gap-1.5">
            <Circle size={14} />
            {remainingTasks} remaining
          </span>
        </div>
      </div>

      {/* Add task */}
      <form onSubmit={handleAddTask} className="mt-6 flex gap-2">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task to your checklist..."
          maxLength={200}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
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

      {/* Error */}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Task list */}
      <div className="mt-5 space-y-1">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
            <ListTodo size={30} className="mx-auto text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              Your checklist is empty
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Add your first task to start tracking progress.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="group flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50"
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => handleToggle(task)}
                title={
                  task.isCompleted ? "Mark as incomplete" : "Mark as complete"
                }
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                  task.isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 hover:border-slate-700"
                }`}
              >
                {task.isCompleted && <Check size={13} />}
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
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-700"
                />
              ) : (
                <span
                  className={`min-w-0 flex-1 text-sm ${
                    task.isCompleted
                      ? "text-slate-400 line-through"
                      : "text-slate-700"
                  }`}
                >
                  {task.title}
                </span>
              )}

              {/* Actions */}
              {editingId === task._id ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(task._id)}
                    title="Save"
                    className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Save size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    title="Cancel"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => startEditing(task)}
                    title="Edit task"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(task._id)}
                    title="Delete task"
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Completed message */}
      {!loading && totalTasks > 0 && progress === 100 && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          <CircleCheck size={18} />
          Great work! You have completed every task in this topic.
        </div>
      )}
    </section>
  );
}
