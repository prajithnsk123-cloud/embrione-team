
import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Build things that matter",
    description:
      "Turn ideas into real projects, experiment with technology, and learn by building.",
  },
  {
    number: "02",
    title: "Grow with your people",
    description:
      "Collaborate with curious minds, share knowledge, and learn from one another.",
  },
  {
    number: "03",
    title: "Make your mark",
    description:
      "Bring your perspective, take initiative, and contribute to something bigger.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080B0A] text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-[#080B0A]">
            E
          </span>

          <span className="text-lg font-bold tracking-[0.16em]">
            EMBRIONE
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-gray-400 sm:flex">
          <Link href="#about" className="transition hover:text-white">
            About
          </Link>
          <Link href="/team" className="transition hover:text-white">
            Our Team
          </Link>
        </div>

        <Link
          href="/register"
          className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#07100B] transition hover:bg-emerald-300"
        >
          Join us <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-12 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] sm:h-[600px] sm:w-[600px]"
        />

        <div className="mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-center px-6 py-24 sm:px-10 sm:py-32">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-10 bg-emerald-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300 sm:text-sm">
              Ideas into impact
            </p>
          </div>

          <h1 className="max-w-5xl text-5xl font-bold leading-[1.05] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
            We don&apos;t just
            <br />
            imagine the future.
            <br />
            <span className="text-emerald-400">We build it.</span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-8 text-gray-400 sm:text-lg">
            A community of curious minds, creative thinkers, and builders.
            Explore what we do, meet the people behind it, and find your place
            in the journey.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-emerald-400 px-7 py-4 font-semibold text-[#07100B] transition hover:-translate-y-0.5 hover:bg-emerald-300"
            >
              Become a member <span aria-hidden="true">↗</span>
            </Link>

            <Link
              href="/team"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 px-7 py-4 font-semibold text-white transition hover:border-emerald-400/50 hover:bg-white/[0.04]"
            >
              Meet the team <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.18em] text-gray-500">
            <span>Curiosity</span>
            <span className="text-emerald-400">✳</span>
            <span>Collaboration</span>
            <span className="text-emerald-400">✳</span>
            <span>Creation</span>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-t border-white/[0.07] bg-[#0D110F] px-6 py-24 sm:px-10 sm:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
                Why Embrione?
              </p>

              <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Good ideas are
                <br />
                just the beginning.
              </h2>
            </div>

            <div>
              <p className="text-base leading-8 text-gray-400 sm:text-lg">
                Great things happen when people come together to learn,
                experiment, and create. We believe in turning curiosity into
                skills, collaboration into opportunities, and ideas into
                meaningful work.
              </p>

              <Link
                href="/team"
                className="mt-7 inline-flex items-center gap-2 font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                Discover our people <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group rounded-2xl border border-white/[0.08] bg-[#111614] p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 sm:p-8"
              >
                <p className="text-sm font-medium text-emerald-400">
                  / {feature.number}
                </p>

                <h3 className="mt-10 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-gray-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-6 py-24 sm:px-10 sm:py-32">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-emerald-400/20 bg-[#101813] px-7 py-14 sm:px-14 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-emerald-400/10 blur-[90px]"
          />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Your next chapter
            </p>

            <h2 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
              Have an idea?
              <br />
              <span className="text-gray-500">Let&apos;s build it.</span>
            </h2>

            <p className="mt-6 max-w-lg leading-7 text-gray-400">
              Bring your curiosity, your creativity, and your willingness to
              learn. Your journey starts with one step.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-emerald-400 px-7 py-4 font-semibold text-[#07100B] transition hover:bg-emerald-300"
            >
              Apply to join <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="font-bold tracking-[0.16em]">
            EMBRIONE<span className="text-emerald-400">.</span>
          </Link>

          <p className="text-sm text-gray-500">
            Built with curiosity. Driven by collaboration.
          </p>

          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/team" className="transition hover:text-white">
              Team
            </Link>
            <Link href="/register" className="transition hover:text-white">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
