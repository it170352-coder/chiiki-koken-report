import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm px-6 py-3.5 sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-gray-900">RaidQ</span>
            <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">Portal</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        {children}
      </main>
    </div>
  );
}
