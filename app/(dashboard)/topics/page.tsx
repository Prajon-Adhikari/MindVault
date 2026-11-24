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
} from "lucide-react";

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

  createdAt: string;
};

const colors = [
  "#D4A373",
  "#64748B",
  "#0D9488",
  "#6366F1",
  "#E87979",
  "#A78BFA",
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
  const [color, setColor] = useState("#D4A373");
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
    setColor("#D4A373");
    setPriority("medium");
    setDeadline("");
    setReminderTime("");
    setNotifyByEmail(false);
    setError("");
  }

  // Open create modal
  function openCreateModal() {
    resetForm();
    setShowModal(true);
  }

  // Open edit modal
  function openEditModal(topic: Topic) {
    setEditingId(topic._id);

    setName(topic.name);
    setDescription(topic.description || "");
    setColor(topic.color || "#D4A373");
    setPriority(topic.priority || "medium");

    setDeadline(formatDateTimeLocal(topic.deadline));

    setReminderTime(topic.reminderTime || "");
    setTimezone(topic.timezone || timezone || "Asia/Kathmandu");

    setNotifyByEmail(Boolean(topic.reminderTime && topic.notifyByEmail));

    setError("");
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

        // Deadline is independent of daily reminders
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
            topic._id === editingId ? data.topic : topic,
          ),
        );
      } else {
        setTopics((previous) => [data.topic, ...previous]);
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // Archive topic
  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to archive this topic? Its resources will be preserved.",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to archive topic");
      }

      setTopics((previous) => previous.filter((topic) => topic._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  // Search topics
  const filteredTopics = topics.filter((topic) => {
    const query = search.toLowerCase();

    return (
      topic.name.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query)
    );
  });

  // Priority badge styling
  function getPriorityStyle(value: Topic["priority"]) {
    switch (value) {
      case "high":
        return "bg-red-50 text-red-700";
      case "medium":
        return "bg-amber-50 text-amber-700";
      case "low":
        return "bg-green-50 text-green-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  function getDeadlineStatus(value: string) {
    const dueDate = new Date(value);
    const now = new Date();

    return dueDate.getTime() < now.getTime();
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Topics</h1>

          <p className="mt-1 text-sm text-slate-500">
            Organize your knowledge, resources, and deadlines.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          <Plus size={18} />
          Create Topic
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Topics</p>
            <Folder size={19} className="text-slate-400" />
          </div>

          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            {topics.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">High Priority</p>
            <Flag size={19} className="text-red-500" />
          </div>

          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            {topics.filter((topic) => topic.priority === "high").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">With Deadlines</p>
            <CalendarDays size={19} className="text-slate-400" />
          </div>

          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            {topics.filter((topic) => topic.deadline).length}
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
        />
      </div>

      {/* Error */}
      {error && !showModal && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Topics */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-slate-400" size={28} />
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <Folder size={42} className="mx-auto text-slate-300" />

          <h3 className="mt-4 font-semibold text-slate-800">
            {search ? "No topics found" : "No topics created yet"}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {search
              ? "Try a different search keyword."
              : "Create your first topic to start organizing your knowledge."}
          </p>

          {!search && (
            <button
              onClick={openCreateModal}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm text-white hover:bg-slate-700"
            >
              Create your first topic
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTopics.map((topic) => (
            <div
              key={topic._id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >
              {/* Card header */}
              <div className="flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${topic.color}20`,
                    color: topic.color,
                  }}
                >
                  <Folder size={25} />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(topic)}
                    title="Edit topic"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(topic._id)}
                    title="Archive topic"
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Topic details */}
              <h3 className="mt-5 font-semibold text-slate-900">
                {topic.name}
              </h3>

              <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                {topic.description || "No description provided."}
              </p>

              {/* Priority and deadline */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                    topic.priority || "medium",
                  )}`}
                >
                  {topic.priority || "medium"} priority
                </span>

                {topic.notifyByEmail && topic.reminderTime && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    <Mail size={12} />
                    Daily at {topic.reminderTime}
                  </span>
                )}
              </div>

              {topic.deadline && (
                <div
                  className={`mt-3 flex items-center gap-2 text-xs ${
                    getDeadlineStatus(topic.deadline)
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  {getDeadlineStatus(topic.deadline) ? (
                    <Clock size={14} />
                  ) : (
                    <CalendarDays size={14} />
                  )}

                  <span>
                    {getDeadlineStatus(topic.deadline)
                      ? "Deadline passed: "
                      : "Due: "}
                    {new Date(topic.deadline).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">
                  {new Date(topic.createdAt).toLocaleDateString()}
                </span>

                <Link
                  href={`/topics/${topic._id}`}
                  className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950"
                >
                  Open folder
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingId ? "Edit Topic" : "Create New Topic"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update your topic information and settings."
                    : "Create a topic and organize your work."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Topic name
              </label>

              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Machine Learning"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you will save in this topic..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Topic deadline
              </label>

              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Optional. Set a target date for completing this topic.
              </p>
            </div>

            {/* Daily reminder */}
            <div className="space-y-3 rounded-xl border border-slate-200 p-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Choose the time when you want to be reminded to practice every
                  day.
                </p>
              </div>

              {/* Email notification */}
              <label
                className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                  reminderTime
                    ? "cursor-pointer border-slate-200 hover:bg-slate-50"
                    : "cursor-not-allowed border-slate-100 bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={notifyByEmail}
                  disabled={!reminderTime}
                  onChange={(e) => setNotifyByEmail(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-slate-900"
                />

                <span>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <Mail size={16} />
                    Send daily email reminder
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    Receive an email at your selected time every day.
                    {!reminderTime &&
                      " Select a reminder time to enable this option."}
                  </span>
                </span>
              </label>

              {reminderTime && notifyByEmail && (
                <p className="flex items-center gap-2 text-xs text-green-700">
                  <Clock size={14} />
                  Daily email reminder enabled for {reminderTime}
                </p>
              )}

              <p className="text-xs text-slate-400">Timezone: {timezone}</p>
            </div>

            {/* Colors */}
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">
                Folder color
              </label>

              <div className="flex items-center gap-3">
                {colors.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setColor(item)}
                    style={{ backgroundColor: item }}
                    className={`h-8 w-8 rounded-full transition ${
                      color === item
                        ? "ring-2 ring-slate-900 ring-offset-2"
                        : ""
                    }`}
                    aria-label={`Select color ${item}`}
                  />
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}

                {editingId ? "Save Changes" : "Create Topic"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
