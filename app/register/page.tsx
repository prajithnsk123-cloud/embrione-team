
"use client";

import { useEffect, useState } from "react";

const domains = [
  "Web Development",
  "Design",
  "Logistics",
  "Operations",
  "Sponsorship",
  "Hospitality",
  "Social Media",
  "Event Management",
];

const positions = ["Head", "Vice-Head", "Core Member", "Member"];

const branches = ["CSE", "AIML", "ECE", "EEE", "ME", "Biotech", "Other"];

const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#080B0A] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10";

const labelClass = "block text-sm font-medium text-gray-300";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [position, setPosition] = useState("Member");
  const [srn, setSrn] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [semester, setSemester] = useState("1");
  const [bio, setBio] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const [photoPreview, setPhotoPreview] = useState("");
  const [convertedPhoto, setConvertedPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    if (
      !name.trim() ||
      !domain ||
      !srn.trim() ||
      !email.trim()
    ) {
      setMessageType("error");
      setMessage("Please complete all required fields.");
      return;
    }

    if (!convertedPhoto) {
      setMessageType("error");
      setMessage("Please upload a profile picture before submitting.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("domain", domain);
      formData.append("position", position);
      formData.append("srn", srn.trim());
      formData.append("email", email.trim());
      formData.append("linkedin", linkedin.trim());
      formData.append("github", github.trim());
      formData.append("branch", branch);
      formData.append("semester", semester);
      formData.append("bio", bio.trim());
      formData.append("photo", convertedPhoto);

      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const result = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(result.error || "Registration failed. Please try again.");
        return;
      }

      setMessageType("success");
      setMessage(
        "Registration submitted successfully! Your profile is pending admin approval."
      );

      setName("");
      setDomain("");
      setPosition("Member");
      setSrn("");
      setEmail("");
      setLinkedin("");
      setGithub("");
      setBranch("CSE");
      setSemester("1");
      setBio("");
      setConvertedPhoto(null);

      const fileInput = document.querySelector<HTMLInputElement>(
        'input[name="photo"]'
      );

      if (fileInput) fileInput.value = "";

      setPhotoPreview((previousUrl) => {
        if (previousUrl) URL.revokeObjectURL(previousUrl);
        return "";
      });
    } catch (error) {
      setMessageType("error");

      if (error instanceof Error && error.name === "AbortError") {
        setMessage(
          "The server took too long to respond. Please try again after checking the server."
        );
      } else {
        setMessage(
          "Unable to complete registration. Please try again."
        );
      }

      console.error("Registration request failed:", error);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  }

  async function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhotoError("");
    setConvertedPhoto(null);
    setMessage("");

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setPhotoError("Please select a PNG or JPG image.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError("Please choose an image smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    const originalUrl = URL.createObjectURL(file);

    try {
      const image = new Image();
      image.src = originalUrl;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("The selected image could not be opened."));
      });

      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / image.naturalWidth);

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(
        1,
        Math.round(image.naturalWidth * scale)
      );
      canvas.height = Math.max(
        1,
        Math.round(image.naturalHeight * scale)
      );

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not create an image canvas.");
      }

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.8);
      });

      if (!blob || blob.type !== "image/webp") {
        throw new Error("WebP conversion failed in this browser.");
      }

      const webpFile = new File(
        [blob],
        `${file.name.replace(/\.[^.]+$/, "")}.webp`,
        { type: "image/webp" }
      );

      setConvertedPhoto(webpFile);

      setPhotoPreview((previousUrl) => {
        if (previousUrl) URL.revokeObjectURL(previousUrl);
        return URL.createObjectURL(webpFile);
      });
    } catch (error) {
      setPhotoError(
        error instanceof Error
          ? error.message
          : "Something went wrong while converting the image."
      );
      event.target.value = "";
    } finally {
      URL.revokeObjectURL(originalUrl);
    }
  }

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080B0A] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        <div className="absolute -left-40 top-[500px] h-96 w-96 rounded-full bg-emerald-500/[0.04] blur-[120px]" />
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
            href="/team"
            className="text-sm text-gray-400 transition hover:text-emerald-400"
          >
            Meet the team ↗
          </a>
        </nav>

        {/* Page heading */}
        <header className="py-12 sm:py-16">
          <a
            href="/"
            className="text-sm text-gray-500 transition hover:text-emerald-400"
          >
            ← Back to home
          </a>

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400 sm:text-sm">
            Your journey starts here
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-[-0.045em] sm:text-6xl">
            Bring your ideas.
            <br />
            <span className="text-emerald-400">Find your people.</span>
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-gray-400">
            Tell us about yourself and the skills you want to bring to
            Embrione. Complete your profile and preview how it will look
            before submitting.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          {/* Registration form */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#101412] p-5 sm:p-8">
            <div className="mb-8 border-b border-white/[0.08] pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Application form
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Tell us about yourself
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Fields marked with * are required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal details */}
              <fieldset className="space-y-5">
                <legend className="mb-5 text-base font-semibold">
                  <span className="mr-2 text-emerald-400">01</span>
                  Personal details
                </legend>

                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="srn" className={labelClass}>
                    Student registration number (SRN) *
                  </label>
                  <input
                    id="srn"
                    name="srn"
                    required
                    value={srn}
                    onChange={(event) => setSrn(event.target.value)}
                    placeholder="e.g. PES1UG23CS001"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </fieldset>

              {/* Team preferences */}
              <fieldset className="space-y-5 border-t border-white/[0.08] pt-7">
                <legend className="mb-5 text-base font-semibold">
                  <span className="mr-2 text-emerald-400">02</span>
                  Team preferences
                </legend>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="domain" className={labelClass}>
                      Domain *
                    </label>
                    <select
                      id="domain"
                      name="domain"
                      required
                      value={domain}
                      onChange={(event) => setDomain(event.target.value)}
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select a domain
                      </option>
                      {domains.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="position" className={labelClass}>
                      Position *
                    </label>
                    <select
                      id="position"
                      name="position"
                      required
                      value={position}
                      onChange={(event) => setPosition(event.target.value)}
                      className={inputClass}
                    >
                      {positions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="branch" className={labelClass}>
                      Academic branch *
                    </label>
                    <select
                      id="branch"
                      name="branch"
                      required
                      value={branch}
                      onChange={(event) => setBranch(event.target.value)}
                      className={inputClass}
                    >
                      {branches.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="semester" className={labelClass}>
                      Semester *
                    </label>
                    <select
                      id="semester"
                      name="semester"
                      required
                      value={semester}
                      onChange={(event) => setSemester(event.target.value)}
                      className={inputClass}
                    >
                      {semesterOptions.map((item) => (
                        <option key={item} value={item}>
                          Semester {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Social profiles */}
              <fieldset className="space-y-5 border-t border-white/[0.08] pt-7">
                <legend className="mb-5 text-base font-semibold">
                  <span className="mr-2 text-emerald-400">03</span>
                  Social profiles
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    Optional
                  </span>
                </legend>

                <div>
                  <label htmlFor="linkedin" className={labelClass}>
                    LinkedIn URL
                  </label>
                  <input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    value={linkedin}
                    onChange={(event) => setLinkedin(event.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="github" className={labelClass}>
                    GitHub URL
                  </label>
                  <input
                    id="github"
                    name="github"
                    type="url"
                    value={github}
                    onChange={(event) => setGithub(event.target.value)}
                    placeholder="https://github.com/your-username"
                    className={inputClass}
                  />
                </div>
              </fieldset>

              {/* Bio */}
              <fieldset className="space-y-3 border-t border-white/[0.08] pt-7">
                <legend className="mb-5 text-base font-semibold">
                  <span className="mr-2 text-emerald-400">04</span>
                  Your introduction
                </legend>

                <label htmlFor="bio" className={labelClass}>
                  Short bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={200}
                  rows={4}
                  placeholder="Tell us about your interests, skills, or what you want to learn..."
                  className={`${inputClass} resize-y`}
                />
                <p className="text-right text-xs text-gray-500">
                  {bio.length}/200 characters
                </p>
              </fieldset>

              {/* Photo upload */}
              <fieldset className="border-t border-white/[0.08] pt-7">
                <legend className="mb-5 text-base font-semibold">
                  <span className="mr-2 text-emerald-400">05</span>
                  Profile picture
                </legend>

                <label
                  htmlFor="photo"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#080B0A] px-5 py-8 text-center transition hover:border-emerald-400/60 hover:bg-emerald-400/[0.03]"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Selected profile preview"
                      className="h-24 w-24 rounded-2xl border border-white/10 object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-2xl text-emerald-400">
                      ↑
                    </span>
                  )}

                  <span className="mt-4 font-semibold">
                    {photoPreview ? "Choose a different photo" : "Upload your photo"}
                  </span>

                  <span className="mt-2 text-sm text-gray-500">
                    PNG or JPG · Maximum 10 MB
                  </span>

                  <span className="mt-1 text-xs text-gray-600">
                    Your image will be converted to WebP before upload.
                  </span>
                </label>

                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/png,image/jpeg"
                  required={!convertedPhoto}
                  onChange={handlePhotoChange}
                  className="sr-only"
                />

                {photoError && (
                  <p className="mt-3 text-sm text-red-400" role="alert">
                    {photoError}
                  </p>
                )}

                {convertedPhoto && (
                  <p className="mt-3 text-sm text-emerald-400" role="status">
                    ✓ Photo ready · {(convertedPhoto.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </fieldset>

              {/* Submission feedback */}
              {message && (
                <div
                  role={messageType === "error" ? "alert" : "status"}
                  className={`rounded-xl border p-4 text-sm leading-6 ${
                    messageType === "success"
                      ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                      : "border-red-400/20 bg-red-400/[0.07] text-red-300"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-emerald-400 px-6 py-4 font-semibold text-[#07100B] transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting application..." : "Submit application"}
                {!isSubmitting && <span aria-hidden="true">↗</span>}
              </button>

              <p className="text-center text-xs leading-5 text-gray-500">
                Your application will be reviewed by an administrator before
                your profile appears in the team directory.
              </p>
            </form>
          </section>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-8">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Live preview
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Your member card
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                This preview updates as you complete the form. Your profile
                is not saved until you submit it.
              </p>
            </div>

            <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#101412] shadow-2xl shadow-black/20">
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#163B2B] via-[#10251B] to-[#080B0A]">
                <div className="absolute -right-8 -top-16 h-52 w-52 rounded-full border border-emerald-400/10" />
                <div className="absolute -right-1 -top-9 h-36 w-36 rounded-full border border-emerald-400/10" />
                <div className="absolute bottom-4 left-5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
                  EMBRIONE / MEMBER
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="relative mt-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#101412] bg-[#18231D] text-3xl font-bold text-emerald-300">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={name ? `${name}'s profile` : "Profile preview"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    name.trim().charAt(0).toUpperCase() || "?"
                  )}
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  {domain || "Your domain"}
                </p>

                <h3 className="mt-2 break-words text-2xl font-bold tracking-tight">
                  {name.trim() || "Your Name"}
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  {position}
                </p>

                <p className="mt-5 min-h-16 whitespace-pre-wrap break-words text-sm leading-7 text-gray-400">
                  {bio.trim() || "Your introduction will appear here as you type."}
                </p>

                <div className="mt-6 space-y-3 border-t border-white/[0.08] pt-5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-500">Branch</span>
                    <span className="text-right text-gray-200">{branch}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-500">Semester</span>
                    <span className="text-right text-gray-200">{semester}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-500">SRN</span>
                    <span className="break-all text-right text-gray-200">
                      {srn || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-500">Email</span>
                    <span className="max-w-[65%] break-all text-right text-gray-200">
                      {email || "Not provided"}
                    </span>
                  </div>
                </div>

                {(linkedin || github) && (
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-white/[0.08] pt-5">
                    {linkedin && (
                      <a
                        href={linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-400 transition hover:text-emerald-300"
                      >
                        LinkedIn ↗
                      </a>
                    )}
                    {github && (
                      <a
                        href={github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-400 transition hover:text-emerald-300"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                )}

                <div className="mt-6 rounded-xl border border-yellow-400/15 bg-yellow-400/[0.05] px-4 py-3">
                  <p className="text-xs leading-5 text-yellow-200/80">
                    Preview only · Your profile becomes eligible for the
                    public directory after admin approval.
                  </p>
                </div>
              </div>
            </article>
          </aside>
        </div>

        <footer className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="font-bold tracking-[0.16em] text-white">
            EMBRIONE<span className="text-emerald-400">.</span>
          </a>
          <p>Built with curiosity. Driven by collaboration.</p>
          <a href="/team" className="transition hover:text-emerald-400">
            Meet the team ↗
          </a>
        </footer>
      </div>
    </main>
  );
}
