import { Suspense } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Bell, Search } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Suspense fallback={<div className="hidden lg:block w-[260px]" />}>
        <Sidebar />
      </Suspense>

      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-md sm:px-8">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Personal Workspace
            </h2>
            <p className="text-xs text-slate-400">
              Organize your knowledge, your way.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Search"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
            </button>

            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              U
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
