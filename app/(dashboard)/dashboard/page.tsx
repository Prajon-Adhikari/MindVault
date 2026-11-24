import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  FileText,
  Folder,
  Bookmark,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export const instant = false;

const stats = [
  { title: "Total Notes", value: "24", icon: FileText },
  { title: "Documents", value: "12", icon: Folder },
  { title: "Bookmarks", value: "18", icon: Bookmark },
  { title: "AI Summaries", value: "08", icon: Sparkles },
];

export default async function DashboardPage() {
  const user = await verifyAuth();

  if (!user) redirect("/login");

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        <p className="text-sm font-medium text-indigo-600">
          YOUR KNOWLEDGE SPACE
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Here's an overview of your personal knowledge workspace.
        </p>
      </section>

      {/* Statistics */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Icon size={21} />
                </div>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>

              <p className="mt-5 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.title}</p>
            </div>
          );
        })}
      </section>

      {/* Main dashboard sections */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your recently added knowledge will appear here.
          </p>

          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
              <FileText size={28} />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-700">
              No recent activity yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Start by creating your first note.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-indigo-600 p-6 text-white">
          <Sparkles size={28} />

          <h2 className="mt-5 text-xl font-bold">Meet your AI Assistant</h2>

          <p className="mt-3 text-sm leading-6 text-indigo-100">
            Explore your saved knowledge, generate summaries, and discover
            connections between your ideas.
          </p>

          <p className="mt-6 text-sm font-semibold text-white">Coming soon →</p>
        </div>
      </section>
    </div>
  );
}
