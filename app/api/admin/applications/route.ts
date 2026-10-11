
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  try {
    // Verify the logged-in user on the server.
    const supabase = await createClient();
    
    const [totalResult, pendingResult, approvedResult] = await Promise.all([
  supabaseAdmin
    .from("members")
    .select("id", { count: "exact", head: true }),

  supabaseAdmin
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending"),

  supabaseAdmin
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved"),
    ]);

    if (totalResult.error || pendingResult.error || approvedResult.error) {
  throw new Error("Failed to load application statistics.");
    }

    const stats = {
  total: totalResult.count ?? 0,
  pending: pendingResult.count ?? 0,
  approved: approvedResult.count ?? 0,
    };

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (
      authError ||
      !user?.email ||
      !adminEmail ||
      user.email.toLowerCase() !== adminEmail
    ) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    // Optional status filter: pending, approved, rejected, or all.
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "pending";

    if (!["pending", "approved", "rejected", "all"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status filter." },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from("members")
      .select(
        "id, name, domain, position, srn, email, linkedin_url, github_url, branch, semester, bio, photo_url, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: members, error: queryError } = await query;

    if (queryError) {
      console.error("Applications query error:", queryError);
      return NextResponse.json(
        { error: "Unable to load applications." },
        { status: 500 }
      );
    }

    // Create temporary image URLs for the private storage bucket.
    const applications = await Promise.all(
      (members ?? []).map(async (member) => {
        let photoSignedUrl: string | null = null;

        if (member.photo_url) {
          const { data, error } = await supabaseAdmin.storage
            .from("member-photos")
            .createSignedUrl(member.photo_url, 3600);

          if (error) {
            console.error("Photo URL error:", error.message);
          } else {
            photoSignedUrl = data.signedUrl;
          }
        }

        return {
          ...member,
          photoSignedUrl,
        };
      })
    );

    return NextResponse.json({ applications, stats });
  } catch (error) {
    console.error("Applications API error:", error);

    return NextResponse.json(
      { error: "Unable to load applications." },
      { status: 500 }
    );
  }
}
