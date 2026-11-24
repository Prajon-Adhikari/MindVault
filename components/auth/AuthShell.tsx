import Link from "next/link";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  mode: "login" | "signup";
}

export default function AuthShell({ children, mode }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f8f9fc] p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        {/* Left image section */}
        <section className="relative hidden min-h-[700px] overflow-hidden bg-[#172554] p-12 text-white md:flex md:flex-col md:justify-between">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{
              backgroundImage: "url('/images/auth-image.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#172554]/90 via-[#172554]/60 to-[#312e81]/80" />

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-2.5">
                <BrainCircuit size={28} />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                MindVault
              </span>
            </Link>
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              <ShieldCheck size={16} />
              Your personal knowledge space
            </div>

            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
              Your knowledge.
              <br />
              Your intelligence.
              <br />
              One place.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-blue-100">
              Save what matters, connect your ideas, and turn scattered
              information into meaningful knowledge.
            </p>
          </div>

          <p className="relative z-10 text-sm text-blue-200">
            © 2026 MindVault. All rights reserved.
          </p>
        </section>

        {/* Right form section */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-10 md:hidden">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold text-slate-900"
              >
                <BrainCircuit className="text-indigo-600" size={28} />
                MindVault
              </Link>
            </div>

            {children}

            <p className="mt-10 text-center text-sm text-slate-500">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <Link
                href={mode === "login" ? "/signup" : "/login"}
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                {mode === "login" ? "Create account" : "Sign in"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
