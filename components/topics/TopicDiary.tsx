"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Pencil,
  Calendar,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";

export type DiaryNote = {
  _id: string;
  title: string;
  content: string;
  entryDate: string;
  color: string;
  createdAt: string;
};

type Props = {
  topicId: string;
  topicName?: string;
};

const VIBRANT_COLORS = [
  { value: "#8B5CF6", label: "Violet", bg: "bg-purple-500", border: "border-purple-500", lightBg: "bg-purple-50", text: "text-purple-700" },
  { value: "#EC4899", label: "Pink", bg: "bg-pink-500", border: "border-pink-500", lightBg: "bg-pink-50", text: "text-pink-700" },
  { value: "#06B6D4", label: "Cyan", bg: "bg-cyan-500", border: "border-cyan-500", lightBg: "bg-cyan-50", text: "text-cyan-700" },
  { value: "#10B981", label: "Emerald", bg: "bg-emerald-500", border: "border-emerald-500", lightBg: "bg-emerald-50", text: "text-emerald-700" },
  { value: "#F59E0B", label: "Amber", bg: "bg-amber-500", border: "border-amber-500", lightBg: "bg-amber-50", text: "text-amber-700" },
  { value: "#EF4444", label: "Rose", bg: "bg-rose-500", border: "border-rose-500", lightBg: "bg-rose-50", text: "text-rose-700" },
  { value: "#6366F1", label: "Indigo", bg: "bg-indigo-500", border: "border-indigo-500", lightBg: "bg-indigo-50", text: "text-indigo-700" },
  { value: "#F97316", label: "Orange", bg: "bg-orange-500", border: "border-orange-500", lightBg: "bg-orange-50", text: "text-orange-700" },
];

export default function TopicDiary({ topicId, topicName }: Props) {
  const [notes, setNotes] = useState<DiaryNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<DiaryNote | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedColor, setSelectedColor] = useState("#8B5CF6");

  async function fetchNotes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/topics/${topicId}/diary`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load diary notes");
      }

      setNotes(data.diaryNotes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, [topicId]);

  function openCreateModal() {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setEntryDate(new Date().toISOString().split("T")[0]);
    setSelectedColor("#8B5CF6");
    setError("");
    setShowModal(true);
  }

  function openEditModal(note: DiaryNote) {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setEntryDate(new Date(note.entryDate).toISOString().split("T")[0]);
    setSelectedColor(note.color || "#8B5CF6");
    setError("");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isEditing = Boolean(editingNote);
      const url = isEditing
        ? `/api/topics/${topicId}/diary/${editingNote!._id}`
        : `/api/topics/${topicId}/diary`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          entryDate,
          color: selectedColor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save diary entry");
      }

      if (isEditing) {
        setNotes((prev) =>
          prev.map((n) => (n._id === editingNote!._id ? data.note : n)),
        );
      } else {
        setNotes((prev) => [data.note, ...prev]);
      }

      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save diary entry");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this diary entry?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/topics/${topicId}/diary/${noteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete diary entry");
      }

      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete diary entry");
    }
  }

  function formatDisplayDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getColorMeta(hex: string) {
    return (
      VIBRANT_COLORS.find((c) => c.value.toLowerCase() === hex.toLowerCase()) ||
      VIBRANT_COLORS[0]
    );
  }

  return (
    <section className="space-y-6">
      {/* Header banner - Refined Black / Onyx Gradient */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 text-white shadow-md border border-zinc-800/80">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/90 text-amber-400 border border-zinc-700/80 shadow-xs">
            <BookOpen size={24} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Daily Learning Diary</h2>
              <Sparkles size={18} className="text-amber-400" />
            </div>

            <p className="mt-1 text-xs text-zinc-400 font-medium">
              Journal everything you accomplished today with clear dates &amp; vibrant tags.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-zinc-950 shadow-sm transition hover:bg-amber-300 active:scale-[0.99]"
        >
          <Plus size={18} />
          New Entry
        </button>
      </div>

      {/* Global Error */}
      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </p>
      )}

      {/* List of Diary Notes */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-zinc-400" />
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center shadow-xs">
          <BookOpen size={42} className="mx-auto text-zinc-300" />

          <h3 className="mt-4 font-bold text-zinc-800 text-lg">
            No diary entries yet
          </h3>

          <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
            Log what you learned or accomplished today in {topicName || "this topic"}.
          </p>

          <button
            onClick={openCreateModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
          >
            <Plus size={16} className="text-amber-400" />
            Write your first entry
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {notes.map((note) => {
            const colorMeta = getColorMeta(note.color);

            return (
              <div
                key={note._id}
                style={{ borderTopColor: note.color }}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md border-t-4"
              >
                <div>
                  {/* Top Bar: Date & Actions */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${colorMeta.lightBg} ${colorMeta.text}`}
                    >
                      <Calendar size={13} />
                      <span>{formatDisplayDate(note.entryDate)}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditModal(note)}
                        title="Edit entry"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(note._id)}
                        title="Delete entry"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 text-base font-bold text-slate-900 leading-snug">
                    {note.title}
                  </h3>

                  {/* Content */}
                  <p className="mt-2.5 whitespace-pre-wrap text-sm text-slate-600 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: note.color }}
                    />
                    <span>{colorMeta.label} Tag</span>
                  </span>

                  <span>
                    Saved {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Creating / Editing Diary Note */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="my-8 w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />

                <h3 className="text-lg font-bold text-slate-900">
                  {editingNote ? "Edit Diary Entry" : "New Daily Diary Entry"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Entry Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Title / Today&apos;s Summary
              </label>

              <input
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What did you work on or accomplish today?"
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-800"
              />
            </div>

            {/* Entry Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Entry Date
              </label>

              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-800"
              />
            </div>

            {/* Color Tag Picker */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Choose Vibrant Color Tag
              </label>

              <div className="flex flex-wrap gap-2.5">
                {VIBRANT_COLORS.map((c) => {
                  const isSelected = selectedColor.toLowerCase() === c.value.toLowerCase();

                  return (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setSelectedColor(c.value)}
                      title={c.label}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition border ${
                        isSelected
                          ? `${c.lightBg} ${c.text} ${c.border} ring-2 ring-offset-1 ring-zinc-800`
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: c.value }}
                      />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content / Diary Details */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Diary Content &amp; Details
              </label>

              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write everything you learned or accomplished today..."
                className="w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-800"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                style={{ backgroundColor: selectedColor }}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {editingNote ? "Update Entry" : "Save Entry"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
