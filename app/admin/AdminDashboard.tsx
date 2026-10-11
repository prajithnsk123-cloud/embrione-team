
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ApplicationStatus = "pending" | "approved" | "rejected";

type Application = {
  id: string;
  name: string;
  domain?: string | null;
  position?: string | null;
  srn?: string | null;
  email: string;
  linkedin_url?: string | null;
  github_url?: string | null;
  branch?: string | null;
  semester?: string | null;
  bio?: string | null;
  photoSignedUrl?: string | null;
  status: ApplicationStatus;
  created_at: string;
};

type Stats = {
  total: number;
  pending: number;
  approved: number;
};

type Filter = "all" | ApplicationStatus;

const filters: { label: string; value: Filter }[] = [
  { label: "All applications", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const statusStyles: Record<ApplicationStatus, string> = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-500/20 bg-red-500/10 text-red-300",
};

const initialStats: Stats = {
  total: 0,
  pending: 0,
  approved: 0,
};

export default function AdminDashboard({
  email,
}: {
  email: string;
}) {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/applications?status=${filter}`,
        { cache: "no-store" }
      );

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load applications."
        );
      }

      setApplications(result.applications ?? []);
      setStats(result.stats ?? initialStats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading applications."
      );
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function handleStatusChange(
    application: Application,
    status: "approved" | "rejected"
  ) {
    const action = status === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${application.name}'s application?`
    );

    if (!confirmed) return;

    setBusyId(application.id);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/applications/${application.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Failed to ${action} application.`
        );
      }

      await loadApplications();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update application status."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Logout failed."
      );
      setLoggingOut(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-[#080a09] text-white">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/[0.07] blur-3xl" />
        <div className="absolute -left-40 top-[45%] h-80 w-80 rounded-full bg-emerald-700/[0.05] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                The Embrione
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Admin <span className="text-emerald-400">dashboard.</span>
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Review applications and manage your team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <p className="text-xs text-zinc-500">Signed in as</p>
              <p className="mt-1 max-w-56 truncate text-sm font-medium text-zinc-200">
                {email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </header>

        {/* Page introduction */}
        <section className="flex flex-col gap-4 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Applications
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Keep track of applicants and make your decisions here.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadApplications()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.06] disabled:opacity-50 sm:self-auto"
          >
            <span aria-hidden="true">↻</span>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </section>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total applications"
            value={stats.total}
            accent="text-white"
            icon="◎"
          />

          <StatCard
            label="Awaiting review"
            value={stats.pending}
            accent="text-amber-300"
            icon="◷"
          />

          <StatCard
            label="Approved"
            value={stats.approved}
            accent="text-emerald-300"
            icon="✓"
          />

          <StatCard
            label="Rejected"
            value={Math.max(
              0,
              stats.total - stats.pending - stats.approved
            )}
            accent="text-red-300"
            icon="×"
          />
        </section>

        {/* Application filters */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Applicant directory
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {applications.length}{" "}
                {applications.length === 1 ? "application" : "applications"}{" "}
                displayed
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition sm:text-sm ${
                    filter === item.value
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#101311] p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
              <p className="mt-4 text-sm text-zinc-400">
                Loading applications...
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && applications.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl text-zinc-400">
                ◇
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No applications found
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                There are no applications in this category yet. Try another
                filter or refresh the dashboard.
              </p>

              {filter !== "all" && (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="mt-5 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
                >
                  View all applications
                </button>
              )}
            </div>
          )}

          {/* Application cards */}
          {!loading && applications.length > 0 && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {applications.map((app) => (
                <article
                  key={app.id}
                  className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101311] transition duration-200 hover:border-emerald-400/20"
                >
                  <div className="p-5 sm:p-6">
                    {/* Applicant heading */}
                    <div className="flex items-start gap-4">
                      <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                        {app.photoSignedUrl ? (
                          <img
                            src={app.photoSignedUrl}
                            alt={`${app.name}'s profile`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-emerald-300">
                            {app.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold tracking-tight">
                            {app.name}
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                              statusStyles[app.status] ??
                              statusStyles.pending
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <p className="mt-1 break-all text-sm text-zinc-400">
                          {app.email}
                        </p>

                        <p className="mt-2 text-xs text-zinc-500">
                          Applied {formatDate(app.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Applicant details */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Detail
                        label="Domain"
                        value={app.domain || "Not specified"}
                      />
                      <Detail
                        label="Position"
                        value={app.position || "Not specified"}
                      />
                      <Detail
                        label="Branch"
                        value={app.branch || "Not specified"}
                      />
                      <Detail
                        label="Semester"
                        value={app.semester || "Not specified"}
                      />
                      <Detail
                        label="SRN"
                        value={app.srn || "Not specified"}
                      />
                    </div>

                    {/* Bio */}
                    {app.bio && (
                      <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          About the applicant
                        </p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                          {app.bio}
                        </p>
                      </div>
                    )}

                    {/* Social links */}
                    {(app.linkedin_url || app.github_url) && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        {app.linkedin_url && (
                          <a
                            href={app.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-emerald-400/30 hover:text-emerald-300"
                          >
                            LinkedIn ↗
                          </a>
                        )}

                        {app.github_url && (
                          <a
                            href={app.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-emerald-400/30 hover:text-emerald-300"
                          >
                            GitHub ↗
                          </a>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {app.status === "pending" && (
                      <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row">
                        <button
                          type="button"
                          onClick={() =>
                            void handleStatusChange(app, "approved")
                          }
                          disabled={busyId === app.id}
                          className="flex-1 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busyId === app.id
                            ? "Updating..."
                            : "✓ Approve application"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleStatusChange(app, "rejected")
                          }
                          disabled={busyId === app.id}
                          className="flex-1 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject application
                        </button>
                      </div>
                    )}

                    {app.status !== "pending" && (
                      <div className="mt-6 border-t border-white/[0.07] pt-4">
                        <p className="text-xs text-zinc-500">
                          This application has been{" "}
                          <span
                            className={
                              app.status === "approved"
                                ? "font-semibold text-emerald-300"
                                : "font-semibold text-red-300"
                            }
                          >
                            {app.status}
                          </span>
                          .
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-14 border-t border-white/[0.07] py-6 text-center text-xs text-zinc-600">
          The Embrione · Application Management
        </footer>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#101311] p-5 transition hover:border-emerald-400/20 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{label}</p>
        <span className="text-xl text-emerald-300">{icon}</span>
      </div>

      <p className={`mt-5 text-3xl font-bold tracking-tight ${accent}`}>
        {value}
      </p>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-1/3 rounded-full bg-emerald-400/60" />
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.06] bg-black/20 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-zinc-200">
        {value}
      </p>
    </div>
  );
}
