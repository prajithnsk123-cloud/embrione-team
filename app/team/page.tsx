
"use client";

import { useEffect, useMemo, useState } from "react";

type Member = {
  id: string;
  name: string;
  domain: string;
  position: string;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  photoSignedUrl: string | null;
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [domain, setDomain] = useState("All");
  const [position, setPosition] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTeam() {
      try {
        const response = await fetch("/api/team", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Could not load team members.");
        }

        setMembers(result.team ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the team."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, []);

  const domains = useMemo(
    () => ["All", ...new Set(members.map((member) => member.domain))],
    [members]
  );

  const positions = useMemo(
    () => ["All", ...new Set(members.map((member) => member.position))],
    [members]
  );

  const filteredMembers = members.filter((member) => {
    const matchesDomain =
      domain === "All" || member.domain === domain;

    const matchesPosition =
      position === "All" || member.position === position;

    const matchesSearch =
      member.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      member.domain.toLowerCase().includes(search.trim().toLowerCase());

    return matchesDomain && matchesPosition && matchesSearch;
  });

  function resetFilters() {
    setDomain("All");
    setPosition("All");
    setSearch("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080B0A] text-white">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        <div className="absolute -left-40 top-[600px] h-96 w-96 rounded-full bg-emerald-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-10 sm:py-12">
        {/* Navigation */}
        <nav className="flex items-center justify-between border-b border-white/[0.08] pb-6">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 font-black text-[#080B0A]">
              E
            </span>
            <span className="font-bold tracking-[0.16em]">
              EMBRIONE
            </span>
          </a>

          <a
            href="/register"
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
          >
            Join the team <span aria-hidden="true">↗</span>
          </a>
        </nav>

        {/* Hero */}
        <header className="py-16 sm:py-24">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400 sm:text-sm">
            <span className="h-px w-8 bg-emerald-400" />
            The people behind the work
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.055em] sm:text-7xl">
              Meet the
              <br />
              people who
              <br />
              <span className="text-emerald-400">make it happen.</span>
            </h1>

            <div className="max-w-md lg:justify-self-end">
              <p className="leading-7 text-gray-400">
                Different skills. Shared curiosity. One community.
                Get to know the people building, creating, and growing
                together at Embrione.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
                  ✳
                </span>
                <div>
                  <p className="text-sm font-semibold">One team</p>
                  <p className="text-xs text-gray-500">
                    Many ways to make an impact
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Directory */}
        <section>
          <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                The directory
              </p>

              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Get to know us
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {loading
                  ? "Finding our people..."
                  : `${filteredMembers.length} ${
                      filteredMembers.length === 1 ? "member" : "members"
                    } found`}
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="self-start text-sm text-gray-400 transition hover:text-emerald-400 sm:self-auto"
            >
              Reset filters ↺
            </button>
          </div>

          {/* Search and filters */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_220px_220px]">
            <label className="relative block">
              <span className="sr-only">Search members</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or domain..."
                className="w-full rounded-xl border border-white/10 bg-[#111614] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-emerald-400/60"
              />
            </label>

            <label>
              <span className="sr-only">Filter by domain</span>
              <select
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#111614] px-4 py-3.5 text-sm text-gray-200 outline-none focus:border-emerald-400/60"
              >
                {domains.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All domains" : item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Filter by position</span>
              <select
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#111614] px-4 py-3.5 text-sm text-gray-200 outline-none focus:border-emerald-400/60"
              >
                {positions.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All positions" : item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 gap-5 py-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111614]"
                >
                  <div className="h-64 bg-white/[0.04]" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-1/3 rounded bg-white/[0.06]" />
                    <div className="h-5 w-2/3 rounded bg-white/[0.06]" />
                    <div className="h-3 w-full rounded bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-8 text-center">
              <h3 className="text-lg font-semibold">
                We couldn't load the directory
              </h3>
              <p className="mt-3 text-sm text-gray-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredMembers.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#111614] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-2xl text-emerald-400">
                ✳
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                {members.length === 0
                  ? "Our story is just beginning"
                  : "No matching members"}
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
                {members.length === 0
                  ? "Approved team profiles will appear here. Check back as our community grows."
                  : "Try another search or clear your filters to see more people."}
              </p>

              {(members.length > 0 || search || domain !== "All" || position !== "All") && (
                <button
                  onClick={resetFilters}
                  className="mt-6 rounded-full border border-emerald-400/30 px-5 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-400/10"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Member cards */}
          {!loading && !error && filteredMembers.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMembers.map((member) => (
                <article
                  key={member.id}
                  className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101412] transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-[0_16px_60px_rgba(16,185,129,0.06)]"
                >
                  {/* Portrait */}
                  <div className="relative h-72 overflow-hidden bg-gradient-to-br from-[#14251D] to-[#0C100E]">
                    {member.photoSignedUrl ? (
                      <img
                        src={member.photoSignedUrl}
                        alt={`${member.name}'s profile`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="flex h-28 w-28 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] text-5xl font-bold text-emerald-300">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#101412] to-transparent" />

                    <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                      {member.domain}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="px-5 pb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                      {member.position}
                    </p>

                    <h3 className="mt-2 break-words text-xl font-bold tracking-tight">
                      {member.name}
                    </h3>

                    <p className="mt-3 min-h-[4.5rem] line-clamp-3 text-sm leading-6 text-gray-400">
                      {member.bio || "A valued part of the Embrione community."}
                    </p>

                    <div className="mt-5 flex min-h-10 items-center gap-3 border-t border-white/[0.08] pt-4">
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on LinkedIn`}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
                        >
                          in <span>LinkedIn ↗</span>
                        </a>
                      )}

                      {member.github_url && (
                        <a
                          href={member.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on GitHub`}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
                        >
                          <span aria-hidden="true">⌘</span>
                          <span>GitHub ↗</span>
                        </a>
                      )}

                      {!member.linkedin_url && !member.github_url && (
                        <span className="text-xs text-gray-600">
                          Embrione member
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Bottom call to action */}
        <section className="mt-24 overflow-hidden rounded-3xl border border-emerald-400/20 bg-[#101813] px-6 py-12 text-center sm:px-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Find your place
          </p>

          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
            The next member could be you.
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-gray-400 sm:text-base">
            Have something to contribute and a willingness to learn?
            Take the first step and introduce yourself.
          </p>

          <a
            href="/register"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-emerald-400 px-7 py-4 font-semibold text-[#07100B] transition hover:-translate-y-0.5 hover:bg-emerald-300"
          >
            Apply to join <span aria-hidden="true">↗</span>
          </a>
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-7 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="font-bold tracking-[0.16em] text-white">
            EMBRIONE<span className="text-emerald-400">.</span>
          </a>

          <p>Built with curiosity. Driven by collaboration.</p>

          <a href="/" className="transition hover:text-emerald-400">
            Back to home ↑
          </a>
        </footer>
      </div>
    </main>
  );
}
