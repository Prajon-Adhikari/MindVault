"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  File,
  Video,
  Trash2,
  ExternalLink,
  Loader2,
  Flame,
  ListTodo,
  BookOpen,
  Folder,
} from "lucide-react";
import TopicChecklist from "@/components/topics/TopicChecklist";
import DailyObjectives from "@/components/topics/DailyObjectives";
import TopicDiary from "@/components/topics/TopicDiary";

type ResourceType = "note" | "link" | "image" | "file" | "video";

type Resource = {
  _id: string;
  title: string;
  description: string;
  type: ResourceType;
  content: string;
  url: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
};

type Topic = {
  _id: string;
  name: string;
  description: string;
};

const resourceOptions = [
  { value: "note", label: "Note", icon: FileText },
  { value: "link", label: "Website link", icon: LinkIcon },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "file", label: "File", icon: File },
  { value: "video", label: "Video", icon: Video },
] as const;

export default function TopicDetailClient({ topicId }: { topicId: string }) {
  const router = useRouter();

  const [mainTab, setMainTab] = useState<"resources" | "diary">("resources");
  const [activeRightTab, setActiveRightTab] = useState<"daily" | "checklist">("daily");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ResourceType>("note");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function fetchData() {
    try {
      const [topicResponse, resourceResponse] = await Promise.all([
        fetch(`/api/topics/${topicId}`),
        fetch(`/api/topics/${topicId}/resources`),
      ]);

      const topicData = await topicResponse.json();
      const resourceData = await resourceResponse.json();

      if (!topicResponse.ok) {
        setError(topicData.message || "Could not load folder");
        return;
      }

      if (!resourceResponse.ok) {
        setError(resourceData.message || "Could not load resources");
        return;
      }

      setTopic(topicData.topic);
      setResources(resourceData.resources);
    } catch {
      setError("Something went wrong while loading this folder");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (topicId) fetchData();
  }, [topicId]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setContent("");
    setUrl("");
    setSelectedFile(null);
    setType("note");
    setError("");
  }

  async function createResource(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("content", content);
    formData.append("url", url);

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const response = await fetch(`/api/topics/${topicId}/resources`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not save resource");
        return;
      }

      setResources((previous) => [data.resource, ...previous]);

      resetForm();
      setShowModal(false);
    } catch {
      setError("Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setResources((previous) =>
          previous.filter((resource) => resource._id !== id),
        );
      } else {
        const data = await response.json();
        setError(data.message || "Could not delete resource");
      }
    } catch {
      setError("Could not delete resource");
    }
  }

  function getResourceIcon(resourceType: ResourceType) {
    switch (resourceType) {
      case "note":
        return <FileText size={20} />;
      case "link":
        return <LinkIcon size={20} />;
      case "image":
        return <ImageIcon size={20} />;
      case "video":
        return <Video size={20} />;
      default:
        return <File size={20} />;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-600">{error || "Folder not found"}</p>

        <button
          onClick={() => router.push("/topics")}
          className="mt-4 text-sm underline"
        >
          Back to folders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
        {/* LEFT SIDE - Topic details and resources */}
        <main className="min-w-0 space-y-8">
          {/* Header */}
          <div>
            <button
              onClick={() => router.push("/topics")}
              className="mb-5 flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              <ArrowLeft size={16} />
              Back to topics
            </button>

            <div className="flex flex-col items-start gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-amber-400 shadow-xs">
                    <FileText size={24} />
                  </div>

                  <h1 className="text-2xl font-extrabold text-zinc-900">
                    {topic.name}
                  </h1>
                </div>

                <p className="mt-3 text-sm text-zinc-500 font-medium">
                  {topic.description || "Manage your resources in this folder."}
                </p>
              </div>

              {/* Add resource button (shown when on resources tab) */}
              {mainTab === "resources" && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-zinc-800 active:scale-[0.99]"
                >
                  <Plus size={18} className="text-amber-400" />
                  Add resource
                </button>
              )}
            </div>
          </div>

          {/* Main Content Navigation Tabs: Resources vs Daily Diary */}
          <div className="flex items-center gap-2 border-b border-zinc-200">
            <button
              onClick={() => setMainTab("resources")}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-bold transition ${
                mainTab === "resources"
                  ? "border-black text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Folder size={18} />
              <span>Resources ({resources.length})</span>
            </button>

            <button
              onClick={() => setMainTab("diary")}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-bold transition ${
                mainTab === "diary"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <BookOpen size={18} className="text-amber-600" />
              <span>Daily Diary</span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Tab Content */}
          {mainTab === "diary" ? (
            <TopicDiary topicId={topic._id} topicName={topic.name} />
          ) : (
            <section className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Your resources</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {resources.length} saved{" "}
                    {resources.length === 1 ? "resource" : "resources"}
                  </p>
                </div>
              </div>

              {/* Resources */}
              {resources.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center">
                  <FileText size={38} className="mx-auto text-slate-300" />

                  <h3 className="mt-4 font-semibold text-slate-800">
                    No resources yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Save notes, links, images, and files in this folder.
                  </p>

                  <button
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
                    className="mt-5 text-sm font-medium text-slate-900 underline"
                  >
                    Add your first resource
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {resources.map((resource) => (
                    <div
                      key={resource._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          {getResourceIcon(resource.type)}
                        </div>

                        <button
                          onClick={() => deleteResource(resource._id)}
                          title="Delete resource"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-900">
                        {resource.title}
                      </h3>

                      <p className="mt-1 text-xs capitalize text-slate-400">
                        {resource.type}
                      </p>

                      {resource.description && (
                        <p className="mt-3 text-sm text-slate-500">
                          {resource.description}
                        </p>
                      )}

                      {resource.type === "note" && (
                        <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">
                          {resource.content}
                        </p>
                      )}

                      {resource.type === "image" && resource.fileUrl && (
                        <a
                          href={resource.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={resource.fileUrl}
                            alt={resource.title}
                            className="mt-4 h-40 w-full rounded-xl object-cover"
                          />
                        </a>
                      )}

                      {(resource.type === "file" ||
                        (resource.type === "video" && resource.fileUrl)) && (
                        <a
                          href={resource.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700 hover:underline"
                        >
                          <File size={16} />
                          {resource.fileName || "Open file"}
                          <ExternalLink size={14} />
                        </a>
                      )}

                      {(resource.type === "link" ||
                        (resource.type === "video" && resource.url)) && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 flex items-center gap-2 break-all text-sm font-medium text-blue-600 hover:underline"
                        >
                          Open link
                          <ExternalLink size={14} />
                        </a>
                      )}

                      <p className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-400">
                        Added {new Date(resource.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>

        {/* RIGHT SIDE - Daily Objectives & Checklist Panel */}
        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start space-y-4">
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 shadow-xs">
            <button
              onClick={() => setActiveRightTab("daily")}
              className={`flex-1 rounded-xl py-2.5 px-3 text-xs font-semibold transition flex items-center justify-center gap-2 ${
                activeRightTab === "daily"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Flame size={15} className="text-orange-500 fill-orange-500" />
              Daily Objectives
            </button>
            <button
              onClick={() => setActiveRightTab("checklist")}
              className={`flex-1 rounded-xl py-2.5 px-3 text-xs font-semibold transition flex items-center justify-center gap-2 ${
                activeRightTab === "checklist"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ListTodo size={15} className="text-slate-600" />
              Checklist
            </button>
          </div>

          <div>
            {activeRightTab === "daily" ? (
              <DailyObjectives topicId={topic._id} />
            ) : (
              <TopicChecklist topicId={topic._id} />
            )}
          </div>
        </aside>
      </div>

      {/* Add resource modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={createResource}
            className="my-8 w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Add a resource
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Save something useful in {topic.name}.
              </p>
            </div>

            {/* Resource type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Resource type
              </label>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {resourceOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        setType(option.value);
                        setSelectedFile(null);
                        setUrl("");
                        setContent("");
                      }}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs ${
                        type === option.value
                          ? "border-slate-900 bg-slate-50 text-slate-900"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      <Icon size={19} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>

              <input
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter resource title"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description (optional)
              </label>

              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a short description"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            {/* Note content */}
            {type === "note" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Note content
                </label>

                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your notes here..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>
            )}

            {/* Website link */}
            {(type === "link" || type === "video") && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {type === "video"
                    ? "Video URL (or upload a video)"
                    : "Website URL"}
                </label>

                <input
                  type="url"
                  required={type === "link"}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>
            )}

            {/* File upload */}
            {(type === "image" || type === "file" || type === "video") && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {type === "image"
                    ? "Select image"
                    : type === "video"
                      ? "Select video (optional if URL is provided)"
                      : "Select file"}
                </label>

                <input
                  type="file"
                  required={type === "image" || type === "file"}
                  accept={
                    type === "image"
                      ? "image/*"
                      : type === "video"
                        ? "video/*"
                        : ".pdf,.doc,.docx,.txt,.csv,.xlsx,.ppt,.pptx,.zip"
                  }
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Maximum upload size: 10 MB.
                </p>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                Save resource
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
