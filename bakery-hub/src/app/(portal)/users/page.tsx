import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import UsersClient, { type PortalUser } from "./UsersClient";

function roleOf(metadata: unknown): "admin" | "user" {
  const r = (metadata as { role?: string } | null)?.role;
  return r === "admin" ? "admin" : "user";
}

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  const raw = data?.users ?? [];

  const users: PortalUser[] = raw.map((u) => {
    const meta = u.user_metadata as { display_name?: string } | null;
    const displayName = meta?.display_name?.trim() ?? "";
    return {
      id: u.id,
      name: displayName || u.email?.split("@")[0] || "（名前未設定）",
      displayName,
      email: u.email ?? "",
      role: roleOf(u.user_metadata),
      createdAt: u.created_at ?? "",
    };
  });

  return (
    <UsersClient
      users={users}
      currentUserId={user.id}
      isAdmin={roleOf(user.user_metadata) === "admin"}
      hasError={!!error}
    />
  );
}
