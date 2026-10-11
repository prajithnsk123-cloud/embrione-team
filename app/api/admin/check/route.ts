
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Verify the session with Supabase, not just a client-side value.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (
    !adminEmail ||
    !user.email ||
    user.email.toLowerCase() !== adminEmail
  ) {
    return NextResponse.json(
      { error: "Admin access denied." },
      { status: 403 }
    );
  }

  return NextResponse.json({ authorized: true });
}
