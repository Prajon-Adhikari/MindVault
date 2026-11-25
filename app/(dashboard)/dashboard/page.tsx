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
        <p className="text-xs font-bold tracking-widest text-amber-600 uppercase">
          YOUR KNOWLEDGE SPACE
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900">
          Welcome back!
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Here&apos;s an overview of your personal knowledge workspace.
        </p>
      </section>

      {/* Statistics */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-black p-3 text-amber-400 shadow-xs">
                  <Icon size={21} />
                </div>
                <ArrowUpRight size={18} className="text-zinc-400" />
              </div>

              <p className="mt-5 text-2xl font-bold text-zinc-900">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-500">{stat.title}</p>
            </div>
          );
        })}
      </section>

      {/* Main dashboard sections */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs xl:col-span-2">
          <h2 className="text-lg font-bold text-zinc-900">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Your recently added knowledge will appear here.
          </p>

          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-zinc-100 p-4 text-zinc-400">
              <FileText size={28} />
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-800">
              No recent activity yet
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Start by creating your first note or topic.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-black p-6 text-white shadow-md border border-zinc-800">
          <div className="inline-flex rounded-xl bg-zinc-900 p-3 text-amber-400 border border-zinc-800">
            <Sparkles size={24} />
          </div>

          <h2 className="mt-5 text-xl font-extrabold text-white">
            Meet your AI Assistant
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Explore your saved knowledge, generate summaries, and discover
            connections between your ideas.
          </p>

          <p className="mt-6 text-xs font-bold tracking-wider text-amber-400 uppercase">
            Coming soon →
          </p>
        </div>
      </section>
    </div>
  );
}
