
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    // Fetch approved members only.
    const { data: members, error } = await supabaseAdmin
      .from("members")
      .select(
        "id, name, domain, position, bio, linkedin_url, github_url, photo_url"
      )
      .eq("status", "approved")
      .order("name", { ascending: true });

    if (error) {
      console.error("Could not fetch team members:", error);
      return NextResponse.json(
        { error: "Could not load team members." },
        { status: 500 }
      );
    }

    // Generate temporary URLs for private profile photos.
    const team = await Promise.all(
      (members ?? []).map(async (member) => {
        const { data, error: photoError } = await supabaseAdmin.storage
          .from("member-photos")
          .createSignedUrl(member.photo_url, 3600);

        if (photoError) {
          console.error("Could not create photo URL:", photoError);
        }

        return {
          id: member.id,
          name: member.name,
          domain: member.domain,
          position: member.position,
          bio: member.bio,
          linkedin_url: member.linkedin_url,
          github_url: member.github_url,
          photoSignedUrl: data?.signedUrl ?? null,
        };
      })
    );

    return NextResponse.json(
      { team },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Team API error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
