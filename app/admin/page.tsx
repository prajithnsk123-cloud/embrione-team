
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "./AdminDashboard";

async function AdminContent() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (
    error ||
    !user ||
    !user.email ||
    !adminEmail ||
    user.email.toLowerCase() !== adminEmail
  ) {
    redirect("/admin/login");
  }

  return <AdminDashboard email={user.email} />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#080b0a] p-10 text-white">
          Loading admin dashboard...
        </main>
      }
    >
      <AdminContent />
    </Suspense>
  );
}


