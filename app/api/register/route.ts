
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  let photoPath: string | null = null;

  try {
    const formData = await request.formData();

    // Read form fields
    const name = String(formData.get("name") ?? "").trim();
    const domain = String(formData.get("domain") ?? "");
    const position = String(formData.get("position") ?? "");
    const srn = String(formData.get("srn") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const linkedin = String(formData.get("linkedin") ?? "").trim();
    const github = String(formData.get("github") ?? "").trim();
    const branch = String(formData.get("branch") ?? "");
    const semester = Number(formData.get("semester"));
    const bio = String(formData.get("bio") ?? "").trim();
    const photo = formData.get("photo");

    // Required fields
    if (!name || !srn || !email || !branch) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    // Allowed form values
    const validDomains = [
      "Web Development",
      "Design",
      "Logistics",
      "Operations",
      "Sponsorship",
      "Hospitality",
      "Social Media",
      "Event Management",
    ];

    const validPositions = [
      "Head",
      "Vice-Head",
      "Core Member",
      "Member",
    ];

    const validBranches = [
      "CSE",
      "AIML",
      "ECE",
      "EEE",
      "ME",
      "Biotech",
      "Other",
    ];

    if (
      !validDomains.includes(domain) ||
      !validPositions.includes(position) ||
      !validBranches.includes(branch) ||
      !Number.isInteger(semester) ||
      semester < 1 ||
      semester > 8 ||
      name.length > 100 ||
      srn.length > 50 ||
      email.length > 254 ||
      bio.length > 200
    ) {
      return NextResponse.json(
        { error: "Some submitted fields are invalid." },
        { status: 400 }
      );
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // LinkedIn and GitHub are optional.
    // If provided, each URL must match its respective website.
    function isValidProfileUrl(
      value: string,
      allowedHosts: string[]
    ): boolean {
      if (!value) return true;

      try {
        const parsed = new URL(value);

        return (
          parsed.protocol === "https:" &&
          allowedHosts.includes(parsed.hostname.toLowerCase()) &&
          parsed.pathname.length > 1
        );
      } catch {
        return false;
      }
    }

    if (
      !isValidProfileUrl(linkedin, [
        "linkedin.com",
        "www.linkedin.com",
      ])
    ) {
      return NextResponse.json(
        { error: "Please enter a valid LinkedIn profile URL." },
        { status: 400 }
      );
    }

    if (
      !isValidProfileUrl(github, [
        "github.com",
        "www.github.com",
      ])
    ) {
      return NextResponse.json(
        { error: "Please enter a valid GitHub profile URL." },
        { status: 400 }
      );
    }

    // Validate profile photo
    if (!(photo instanceof File) || photo.size === 0) {
      return NextResponse.json(
        { error: "Please select a profile photo." },
        { status: 400 }
      );
    }

    if (
      photo.type !== "image/webp" ||
      !photo.name.toLowerCase().endsWith(".webp") ||
      photo.size > 5 * 1024 * 1024
    ) {
      return NextResponse.json(
        { error: "Please upload a WebP photo under 5 MB." },
        { status: 400 }
      );
    }

    
    // Check whether this SRN is already registered
    const { data: existingMember, error: lookupError } =
      await supabaseAdmin
        .from("members")
        .select("id")
        .eq("srn", srn)
        .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existingMember) {
      return NextResponse.json(
        { error: "This SRN has already been registered." },
        { status: 409 }
      );
    }

    // Upload photo with a unique filename
    photoPath = `${crypto.randomUUID()}.webp`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("member-photos")
      .upload(photoPath, photo, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Insert registration into the database
    const { data: member, error: insertError } =
      await supabaseAdmin
        .from("members")
        .insert({       
          name,
          domain,
          position,
          srn,
          email,
          linkedin_url: linkedin || null,
          github_url: github || null,
          branch,
          semester,
          bio: bio || null,
          photo_url: photoPath,
          status: "pending",
        })
        .select("id, status")
        .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json(
      {
        message: "Registration submitted successfully!",
        member,
      },
      { status: 201 }
    );
  } catch (error) {
    // Remove uploaded photo if the database insert fails
    if (photoPath) {
      try {
        const { error: cleanupError } = await supabaseAdmin.storage
          .from("member-photos")
          .remove([photoPath]);

        if (cleanupError) {
          console.error("Photo cleanup error:", cleanupError);
        }
      } catch (cleanupError) {
        console.error("Photo cleanup error:", cleanupError);
      }
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Registration failed. Check the VS Code terminal for details." },
      { status: 500 }
    );
  }
}
