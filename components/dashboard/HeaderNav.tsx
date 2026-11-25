"use client";

import { useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function HeaderNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            className="rounded-xl border border-zinc-200 p-2.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <h2 className="text-sm font-bold text-zinc-900">
              Personal Workspace
            </h2>
            <p className="hidden text-xs text-zinc-500 sm:block">
              Organize your knowledge, your way.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Search"
            className="rounded-xl border border-zinc-200 p-2.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-xl border border-zinc-200 p-2.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>

          <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-amber-400 shadow-xs">
            U
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative z-10 h-full max-w-[280px] w-full">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
