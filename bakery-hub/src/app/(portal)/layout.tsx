import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortalSidebar from "./PortalSidebar";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50 text-gray-900">
      <PortalSidebar email={user.email} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
