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
  X,
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

type Props = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-zinc-200 bg-white">
      {/* Logo */}
      <div className="flex h-[76px] items-center justify-between border-b border-zinc-100 px-6">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <div className="rounded-xl bg-black p-2 text-white shadow-xs">
            <BrainCircuit size={22} className="text-amber-400" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-zinc-900">
            Mind<span className="text-amber-600">Vault</span>
          </span>
        </Link>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close mobile menu"
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-800 lg:hidden"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Collapse sidebar"
            className="hidden rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-800 lg:block"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Create button */}
      <div className="px-4 pt-6">
        <Link
          href="/dashboard/notes/new"
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.99]"
        >
          <Plus size={18} className="text-amber-400" />
          Create new
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
        {navigation.map((group) => (
          <div key={group.heading}>
            <h3 className="mb-3 px-3 text-[10px] font-bold tracking-[0.15em] text-zinc-400">
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
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                      isActive
                        ? "bg-black text-white shadow-xs"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.2 : 1.8}
                      className={isActive ? "text-amber-400" : ""}
                    />
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar footer */}
      <div className="border-t border-zinc-100 p-4">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-bold text-amber-400 shadow-xs">
              MV
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">
                Personal Workspace
              </p>
              <p className="text-xs font-medium text-zinc-500">Free plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
