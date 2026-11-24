"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/auth/${isSignup ? "signup" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(isSignup && { name }),
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Authentication failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

  return (
    <div>
      <div className="mb-8">
        <div className="mb-5 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <BrainCircuit size={28} />
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {isSignup
            ? "Start building your personal knowledge space today."
            : "Sign in to continue exploring your knowledge."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignup && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full name
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
                autoComplete="name"
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>

          <div className="relative">
            <LockKeyhole
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-12`}
              required
              minLength={8}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isSignup && (
            <p className="mt-2 text-xs text-slate-400">
              Use at least 8 characters.
            </p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}

          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <p className="mt-8 text-center text-xs leading-5 text-slate-400">
        By continuing, you agree to use MindVault responsibly and keep your
        account credentials secure.
      </p>
    </div>
  );
}
