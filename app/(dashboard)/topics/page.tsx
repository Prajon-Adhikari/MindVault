"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Folder,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  X,
  ArrowUpRight,
  CalendarDays,
  Mail,
  Flag,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { calculateTopicProgress } from "@/lib/progressHelper";

type Topic = {
  _id: string;
  name: string;
  description: string;
  color: string;
  priority: "low" | "medium" | "high";
  deadline: string | null;

  reminderTime?: string;
  timezone?: string;
  notifyByEmail: boolean;

  totalTasks?: number;
  completedTasks?: number;

  createdAt: string;
};

const colors = [
  "#09090B", // Onyx Black
  "#D97706", // Amber
  "#059669", // Emerald
  "#4F46E5", // Indigo
  "#7C3AED", // Violet
  "#E11D48", // Rose
];

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [reminderTime, setReminderTime] = useState("");
  const [notifyByEmail, setNotifyByEmail] = useState(false);
  const [timezone, setTimezone] = useState("Asia/Kathmandu");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#09090B");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [deadline, setDeadline] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function formatDateTimeLocal(value: string | null) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  // Fetch topics
  async function fetchTopics() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/topics");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load topics");
      }

      setTopics(data.topics || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (userTimezone) {
      setTimezone(userTimezone);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, []);

  // Reset form
  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setColor("#09090B");
    setPriority("medium");
    setDeadline("");
    setReminderTime("");
    setNotifyByEmail(false);
    setError("");
  }

  // Open edit modal
  function openEditModal(topic: Topic) {
    setEditingId(topic._id);

    setName(topic.name);
    setDescription(topic.description || "");
    setColor(topic.color || "#09090B");
    setPriority(topic.priority || "medium");

    setDeadline(formatDateTimeLocal(topic.deadline));

    setReminderTime(topic.reminderTime || "");
    setTimezone(topic.timezone || timezone || "Asia/Kathmandu");

    setNotifyByEmail(Boolean(topic.reminderTime && topic.notifyByEmail));

    setError("");
    setShowModal(true);
  }

  // Open create modal
  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  // Create or update topic
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Topic name is required");
      return;
    }

    if (notifyByEmail && !reminderTime) {
      setError("Please select a daily reminder time first");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isEditing = Boolean(editingId);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        color,
        priority,

        // Deadline
        deadline: deadline ? new Date(deadline).toISOString() : null,

        // Daily reminder settings
        reminderTime: reminderTime || "",
        timezone,
        notifyByEmail: reminderTime ? notifyByEmail : false,
      };

      const response = await fetch(
        isEditing ? `/api/topics/${editingId}` : "/api/topics",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed");
      }

      if (isEditing) {
        setTopics((previous) =>
          previous.map((topic) =>
            topic._id === editingId ? { ...topic, ...data.topic } : topic,
          ),
        );
      } else {
        setTopics((previous) => [data.topic, ...previous]);
      }

      setShowModal(false);
      resetForm();
      fetchTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // Delete topic
  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this topic?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete topic");
      }

      setTopics((previous) => previous.filter((topic) => topic._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete topic");
    }
  }

  const filteredTopics = topics.filter((topic) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      topic.name.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query)
    );
  });

  function getPriorityStyle(value: string) {
    switch (value) {
      case "high":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "medium":
        return "bg-amber-50 text-amber-800 border border-amber-200";
      case "low":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            My Topics
          </h1>

          <p className="mt-1 text-sm text-zinc-500 font-medium">
            Organize your knowledge, resources, daily objectives, and deadlines.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800 active:scale-[0.99]"
        >
          <Plus size={18} className="text-amber-400" />
          Create Topic
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-500">Total Topics</p>
            <Folder size={19} className="text-zinc-400" />
          </div>

          <h2 className="mt-3 text-3xl font-extrabold text-zinc-900">
            {topics.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-500">High Priority</p>
            <Flag size={19} className="text-rose-500" />
          </div>

          <h2 className="mt-3 text-3xl font-extrabold text-zinc-900">
            {topics.filter((topic) => topic.priority === "high").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-500">With Deadlines</p>
            <CalendarDays size={19} className="text-zinc-400" />
          </div>

          <h2 className="mt-3 text-3xl font-extrabold text-zinc-900">
            {topics.filter((topic) => topic.deadline).length}
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md w-full">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics..."
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-800"
        />
      </div>

      {/* Error */}
      {error && !showModal && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Topics Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-zinc-400" size={28} />
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center shadow-xs">
          <Folder size={42} className="mx-auto text-zinc-300" />

          <h3 className="mt-4 font-bold text-zinc-800 text-lg">
            {search ? "No topics found" : "No topics created yet"}
          </h3>

          <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
            {search
              ? "Try a different search keyword."
              : "Create your first topic to start organizing your knowledge."}
          </p>

          {!search && (
            <button
              onClick={openCreateModal}
              className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 shadow-xs"
            >
              Create your first topic
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTopics.map((topic) => {
            const progressInfo = calculateTopicProgress(
              topic.createdAt,
              topic.deadline,
              topic.totalTasks || 0,
              topic.completedTasks || 0,
            );

            return (
              <div
                key={topic._id}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md"
              >
                <div>
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs"
                      style={{
                        backgroundColor: topic.color || "#09090B",
                        color: "#FFFFFF",
                      }}
                    >
                      <Folder size={24} />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(topic)}
                        title="Edit topic"
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(topic._id)}
                        title="Archive topic"
                        className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Topic details */}
                  <h3 className="mt-4 text-base font-bold text-zinc-900 leading-snug">
                    {topic.name}
                  </h3>

                  <p className="mt-2 min-h-10 text-sm leading-relaxed text-zinc-500">
                    {topic.description || "No description provided."}
                  </p>

                  {/* Priority and Daily reminder badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${getPriorityStyle(
                        topic.priority || "medium",
                      )}`}
                    >
                      {topic.priority || "medium"} priority
                    </span>

                    {topic.notifyByEmail && topic.reminderTime && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        <Mail size={12} />
                        Daily {topic.reminderTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Status Section */}
                <div className="mt-6 space-y-2 border-t border-zinc-100 pt-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-600">Overall Progress</span>
                    <span className="text-zinc-900 font-extrabold">{progressInfo.progress}%</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressInfo.progress === 100
                          ? "bg-emerald-500"
                          : progressInfo.isOverdue
                          ? "bg-rose-500"
                          : "bg-black"
                      }`}
                      style={{ width: `${progressInfo.progress}%` }}
                    />
                  </div>

                  {/* Details row: Tasks completed & Deadline Status */}
                  <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 pt-1">
                    <span>
                      {progressInfo.totalTasks > 0
                        ? `${progressInfo.completedTasks}/${progressInfo.totalTasks} tasks done`
                        : "No tasks yet"}
                    </span>

                    {topic.deadline ? (
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          progressInfo.isOverdue
                            ? "text-rose-600"
                            : progressInfo.progress === 100
                            ? "text-emerald-600"
                            : "text-zinc-700"
                        }`}
                      >
                        {progressInfo.isOverdue ? (
                          <AlertCircle size={12} />
                        ) : progressInfo.progress === 100 ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {progressInfo.statusText}
                      </span>
                    ) : (
                      <span className="text-zinc-400">No deadline set</span>
                    )}
                  </div>

                  {/* Card Footer Link */}
                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-zinc-50">
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Created {new Date(topic.createdAt).toLocaleDateString()}
                    </span>

                    <Link
                      href={`/topics/${topic._id}`}
                      className="flex items-center gap-1 text-xs font-bold text-zinc-900 hover:text-amber-600 transition"
                    >
                      Open topic
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-lg space-y-5 rounded-2xl bg-white p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  {editingId ? "Edit Topic" : "Create New Topic"}
                </h2>

                <p className="mt-1 text-xs text-zinc-500 font-medium">
                  {editingId
                    ? "Update your topic information and deadline settings."
                    : "Create a topic to organize your resources, tasks, and notes."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Topic name
              </label>

              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Machine Learning"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-800"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Description
              </label>

              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you will save in this topic..."
                className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-800"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-800"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Topic deadline
              </label>

              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-zinc-800"
              />

              <p className="mt-1 text-xs text-zinc-500">
                Target deadline for completing this topic.
              </p>
            </div>

            {/* Daily reminder */}
            <div className="space-y-3 rounded-xl border border-zinc-200 p-4 bg-zinc-50/50">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Clock size={16} />
                  Daily practice reminder
                </label>

                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => {
                    setReminderTime(e.target.value);

                    if (!e.target.value) {
                      setNotifyByEmail(false);
                    }
                  }}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-800"
                />

                <p className="mt-1 text-xs text-zinc-500">
                  Choose the time when you want to be reminded every day.
                </p>
              </div>

              {/* Email notification */}
              <label
                className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                  reminderTime
                    ? "cursor-pointer border-zinc-200 bg-white hover:bg-zinc-50"
                    : "cursor-not-allowed border-zinc-100 bg-zinc-100/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={notifyByEmail}
                  disabled={!reminderTime}
                  onChange={(e) => setNotifyByEmail(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-black"
                />

                <span>
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                    <Mail size={16} />
                    Send daily email reminder
                  </span>

                  <span className="mt-1 block text-xs text-zinc-500">
                    Receive an email at your selected time every day.
                    {!reminderTime &&
                      " Select a reminder time to enable this option."}
                  </span>
                </span>
              </label>

              {reminderTime && notifyByEmail && (
                <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <Clock size={14} />
                  Daily email reminder enabled for {reminderTime}
                </p>
              )}

              <p className="text-xs text-zinc-400">Timezone: {timezone}</p>
            </div>

            {/* Colors */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Folder accent color
              </label>

              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      color === c
                        ? "border-zinc-900 scale-110 ring-2 ring-offset-2 ring-zinc-400"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-50"
              >
                {saving && <Loader2 size={15} className="animate-spin text-amber-400" />}
                {editingId ? "Update Topic" : "Create Topic"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
