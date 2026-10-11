
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify the signed-in user
    const supabase = await createClient();
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
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // 2. Get and validate the application ID
    const { id } = await params;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id)) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 }
      );
    }

    // 3. Accept only approved or rejected
    const body = await request.json();
    const status = body?.status;

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { error: "Status must be approved or rejected." },
        { status: 400 }
      );
    }

    // 4. Update only an application that is still pending
    const { data, error } = await supabaseAdmin
      .from("members")
      .update({ status })
      .eq("id", id)
      .eq("status", "pending")
      .select("id, status")
      .maybeSingle();

    if (error) {
      console.error("Application status update failed:", error);
      return NextResponse.json(
        { error: "Could not update application." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Application not found or no longer pending." },
        { status: 409 }
      );
    }

    // 5. Return the updated status
    return NextResponse.json({
      success: true,
      application: data,
    });
  } catch (error) {
    console.error("Approval API error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
