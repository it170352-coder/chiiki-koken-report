import { createClient } from "@/lib/supabase/server";
import type { Product, InventoryLog } from "@/lib/types";
import InventoryBulkClient from "./InventoryBulkClient";

function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function InventoryPage(
  props: PageProps<"/bakery/inventory">,
) {
  const sp = await props.searchParams;
  const date =
    typeof sp.date === "string" && sp.date ? sp.date : todayStr();

  const prev = new Date(`${date}T00:00:00`);
  prev.setDate(prev.getDate() - 1);
  const prevDate = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;

  const supabase = await createClient();
  const [{ data: products }, { data: logs }, { data: prevLogs }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("inventory_logs")
      .select("product_id, produced, sold, wasted")
      .eq("date", date),
    supabase
      .from("inventory_logs")
      .select("product_id, produced")
      .eq("date", prevDate),
  ]);
  const prevProducedMap = new Map(
    ((prevLogs ?? []) as { product_id: string; produced: number }[]).map((l) => [
      l.product_id,
      l.produced,
    ]),
  );

  const productList = (products ?? []) as Pick<Product, "id" | "name">[];
  const logList = (logs ?? []) as Pick<
    InventoryLog,
    "product_id" | "produced" | "sold" | "wasted"
  >[];
  const logMap = new Map(logList.map((l) => [l.product_id, l]));

  const totalWasted = logList.reduce((sum, l) => sum + l.wasted, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-bark-900">在庫・廃棄記録</h1>
        <form method="get" className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-bark-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg border border-bark-300 px-3 py-1.5 text-sm font-medium text-bark-700 hover:bg-bark-50"
          >
            表示
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-500">
        製造数・販売数・廃棄数を入力すると、残数（製造 − 販売 − 廃棄）が自動計算されます。この日の廃棄合計：
        <span className="font-semibold text-bark-700">{totalWasted} 個</span>
      </p>

      {productList.length === 0 ? (
        <p className="rounded-2xl border border-bark-100 bg-white p-5 text-sm text-gray-400">
          商品が登録されていません。「商品」ページから登録してください。
        </p>
      ) : (
        <InventoryBulkClient
          date={date}
          products={productList.map((p) => {
            const log = logMap.get(p.id);
            return {
              id: p.id,
              name: p.name,
              produced: log?.produced ?? 0,
              sold: log?.sold ?? 0,
              wasted: log?.wasted ?? 0,
              prevProduced: prevProducedMap.get(p.id) ?? null,
            };
          })}
        />
      )}
    </div>
  );
}
