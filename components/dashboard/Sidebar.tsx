"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  LayoutDashboard,
  NotebookPen,
  FileText,
  Bookmark,
  Folder,
  Sparkles,
  Search,
  Network,
  Layers,
  CalendarCheck,
  ChartNoAxesCombined,
  Settings,
  ChevronLeft,
  Plus,
} from "lucide-react";

const navigation = [
  {
    heading: "WORKSPACE",
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "YOUR KNOWLEDGE",
    items: [
      { label: "All Notes", href: "/dashboard/notes", icon: NotebookPen },
      { label: "Documents", href: "/dashboard/documents", icon: FileText },
      { label: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
      { label: "Collections", href: "/dashboard/collections", icon: Folder },
      { label: "All Topics", href: "/topics", icon: Folder },
    ],
  },

  {
    heading: "AI INTELLIGENCE",
    items: [
      { label: "AI Assistant", href: "/dashboard/assistant", icon: Sparkles },
      { label: "Semantic Search", href: "/dashboard/search", icon: Search },
      { label: "Knowledge Graph", href: "/dashboard/graph", icon: Network },
    ],
  },
  {
    heading: "LEARNING CENTER",
    items: [
      { label: "Flashcards", href: "/dashboard/flashcards", icon: Layers },
      {
        label: "Review Schedule",
        href: "/dashboard/reviews",
        icon: CalendarCheck,
      },
    ],
  },
  {
    heading: "MANAGEMENT",
    items: [
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: ChartNoAxesCombined,
      },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-slate-200 bg-white lg:flex">
      {/* Logo */}
      <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white">
            <BrainCircuit size={23} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Mind<span className="text-indigo-600">Vault</span>
          </span>
        </Link>

        <button
          type="button"
          aria-label="Collapse sidebar"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Create button */}
      <div className="px-4 pt-6">
        <Link
          href="/dashboard/notes/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Create new
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
        {navigation.map((group) => (
          <div key={group.heading}>
            <h3 className="mb-3 px-3 text-[10px] font-bold tracking-[0.13em] text-slate-400">
              {group.heading}
            </h3>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar footer */}
      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
              MV
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                Personal Workspace
              </p>
              <p className="text-xs text-slate-500">Free plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
