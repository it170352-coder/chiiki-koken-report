import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store";
import NavBar from "@/components/NavBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, userId, storeId } = await getCurrentStore();

  if (!userId) {
    redirect("/login");
  }

  const { data: store } = await supabase
    .from("stores")
    .select("name")
    .eq("id", storeId ?? "")
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <NavBar storeName={store?.name ?? ""} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
