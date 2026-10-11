
"use client";

import { FormEvent, useState , useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
  setEmail("");
  setPassword("");
}, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError("Invalid email or password.");
        return;
      }

      // Verify the user's identity and admin permission on the server.
      const response = await fetch("/api/admin/check", {
        cache: "no-store",
      });

      if (!response.ok) {
        await supabase.auth.signOut();
        setError("This account is not authorized to access the admin dashboard.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080b0a] text-white flex items-center justify-center px-5">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 space-y-5"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            EMBRIONE
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Admin login
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to manage recruitment applications.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-gray-300">
            Admin email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="off"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-emerald-400"
            placeholder="admin@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-emerald-400"
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <a
          href="/"
          className="block text-center text-sm text-gray-400 hover:text-white"
        >
          Back to home
        </a>
      </form>
    </main>
  );
}
