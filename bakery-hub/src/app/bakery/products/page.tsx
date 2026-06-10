import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";
import type { Product, InventoryLog, Ingredient } from "@/lib/types";
import { PRODUCT_CATEGORIES, INGREDIENT_CATEGORIES } from "@/lib/types";
import { createProduct } from "./actions";
import { upsertIngredient } from "../ingredients/actions";
import ProductRow from "./ProductRow";
import IngredientRow from "../ingredients/IngredientRow";
import InventoryBulkClient from "../inventory/InventoryBulkClient";
import CsvImportButton from "./CsvImportButton";
import CsvDownloadButton from "@/components/CsvDownloadButton";
import Link from "next/link";

function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const TABS = [
  { key: "products", label: "商品" },
  { key: "inventory", label: "在庫" },
  { key: "ingredients", label: "原材料" },
];

export default async function ProductsPage(props: PageProps<"/bakery/products">) {
  const sp = await props.searchParams;
  const tab = typeof sp.tab === "string" && sp.tab ? sp.tab : "products";
  const date = typeof sp.date === "string" && sp.date ? sp.date : todayStr();

  const supabase = await createClient();
  const { storeId } = await getCurrentStore();

  // 商品タブ
  let productList: Product[] = [];
  if (tab === "products") {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    productList = (data ?? []) as Product[];
  }

  // 在庫タブ
  let inventoryProducts: Pick<Product, "id" | "name">[] = [];
  let inventoryRows: { id: string; name: string; produced: number; sold: number; wasted: number; prevProduced: number | null }[] = [];
  let totalWasted = 0;
  if (tab === "inventory") {
    const prev = new Date(`${date}T00:00:00`);
    prev.setDate(prev.getDate() - 1);
    const prevDate = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;

    const [{ data: products }, { data: logs }, { data: prevLogs }] = await Promise.all([
      supabase.from("products").select("id, name").eq("is_active", true).order("name"),
      supabase.from("inventory_logs").select("product_id, produced, sold, wasted").eq("date", date),
      supabase.from("inventory_logs").select("product_id, produced").eq("date", prevDate),
    ]);

    inventoryProducts = (products ?? []) as Pick<Product, "id" | "name">[];
    const logList = (logs ?? []) as Pick<InventoryLog, "product_id" | "produced" | "sold" | "wasted">[];
    const logMap = new Map(logList.map((l) => [l.product_id, l]));
    const prevMap = new Map(((prevLogs ?? []) as { product_id: string; produced: number }[]).map((l) => [l.product_id, l.produced]));
    totalWasted = logList.reduce((sum, l) => sum + l.wasted, 0);

    inventoryRows = inventoryProducts.map((p) => {
      const log = logMap.get(p.id);
      return { id: p.id, name: p.name, produced: log?.produced ?? 0, sold: log?.sold ?? 0, wasted: log?.wasted ?? 0, prevProduced: prevMap.get(p.id) ?? null };
    });
  }

  // 原材料タブ
  let ingredientGroups = new Map<string, Ingredient[]>();
  if (tab === "ingredients") {
    const { data } = await supabase.from("ingredients").select("*").eq("store_id", storeId ?? "").order("category").order("name");
    const list = (data ?? []) as Ingredient[];
    for (const item of list) {
      const arr = ingredientGroups.get(item.category) ?? [];
      arr.push(item);
      ingredientGroups.set(item.category, arr);
    }
  }

  return (
    <div className="space-y-6">
      {/* タブ */}
      <div className="flex gap-2 rounded-2xl border border-bark-100 bg-bark-50 p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/products?tab=${t.key}`}
            className={`flex-1 rounded-xl py-2 text-center text-sm font-medium transition ${
              tab === t.key
                ? "bg-white text-bark-900 shadow-sm"
                : "text-gray-500 hover:text-bark-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* 商品タブ */}
      {tab === "products" && (
        <>
          <div className="flex justify-end gap-2">
            <CsvDownloadButton
              filename="商品一覧.csv"
              label="CSVエクスポート"
              headers={["商品名", "カテゴリ", "価格", "状態"]}
              rows={productList.map((p) => [p.name, p.category ?? "", p.price, p.is_active ? "販売中" : "停止中"])}
            />
            <CsvImportButton type="products" />
          </div>
          <form
            action={createProduct}
            className="grid gap-3 rounded-2xl border border-bark-100 bg-white p-5 sm:grid-cols-[2fr_1fr_1fr_auto]"
          >
            <input name="name" required placeholder="商品名（例：クロワッサン）" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none" />
            <select name="category" defaultValue="" className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-bark-500 focus:outline-none">
              <option value="">カテゴリを選択</option>
              {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="price" type="number" min="0" placeholder="価格（円）" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none" />
            <button className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700">追加</button>
          </form>

          <div className="overflow-hidden rounded-2xl border border-bark-100 bg-white">
            {productList.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">まだ商品が登録されていません。上のフォームから追加してください。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="border-b border-bark-100 bg-bark-50/50 text-left text-gray-500">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">商品名</th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">カテゴリ</th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">価格</th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">状態</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.map((p) => <ProductRow key={p.id} product={p} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* 在庫タブ */}
      {tab === "inventory" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              製造数・販売数・廃棄数を入力すると残数が自動計算されます。廃棄合計：
              <span className="font-semibold text-bark-700">{totalWasted} 個</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <CsvDownloadButton
                filename={`在庫_${date}.csv`}
                label="CSVエクスポート"
                headers={["商品名", "製造数", "販売数", "廃棄数"]}
                rows={inventoryRows.map((r) => [r.name, r.produced, r.sold, r.wasted])}
              />
              <CsvImportButton type="inventory" date={date} />
              <form method="get" className="flex items-center gap-2">
              <input type="hidden" name="tab" value="inventory" />
              <input type="date" name="date" defaultValue={date} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-bark-500 focus:outline-none" />
              <button type="submit" className="rounded-lg border border-bark-300 px-3 py-1.5 text-sm font-medium text-bark-700 hover:bg-bark-50">表示</button>
              </form>
            </div>
          </div>

          {inventoryProducts.length === 0 ? (
            <p className="rounded-2xl border border-bark-100 bg-white p-5 text-sm text-gray-400">
              商品が登録されていません。「商品」タブから登録してください。
            </p>
          ) : (
            <InventoryBulkClient date={date} products={inventoryRows} />
          )}
        </>
      )}

      {/* 原材料タブ */}
      {tab === "ingredients" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href="/bakery/ingredients/recipes" className="rounded-lg border border-bark-300 px-3 py-2 text-sm font-medium text-bark-700 hover:bg-bark-50">
              レシピ管理
            </Link>
            <CsvDownloadButton
              filename="原材料一覧.csv"
              label="CSVエクスポート"
              headers={["カテゴリ", "名前", "単位", "最低在庫", "仕入単価", "仕入先"]}
              rows={[...ingredientGroups.values()].flat().map((i) => [i.category, i.name, i.unit, i.minimum_stock, i.purchase_price, i.supplier ?? ""])}
            />
            <CsvImportButton type="ingredients" />
          </div>

          <div className="rounded-2xl border border-bark-100 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-700">原材料を追加</h2>
            <form action={upsertIngredient} className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">カテゴリ</label>
                  <select name="category" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none">
                    <option value="">選択してください</option>
                    {INGREDIENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">名前</label>
                  <input type="text" name="name" required placeholder="強力粉" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">単位</label>
                  <input type="text" name="unit" required placeholder="kg" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">最低在庫</label>
                  <input type="number" name="minimum_stock" min={0} step="any" defaultValue={0} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">仕入単価</label>
                  <input type="number" name="purchase_price" min={0} step="any" defaultValue={0} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">仕入先（任意）</label>
                  <input type="text" name="supplier" placeholder="〇〇商店" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700">追加</button>
            </form>
          </div>

          {ingredientGroups.size === 0 ? (
            <div className="rounded-2xl border border-bark-100 bg-white p-6 text-center text-sm text-gray-400">
              まだ登録されていません。上のフォームから追加してください。
            </div>
          ) : (
            <div className="space-y-6">
              {[...ingredientGroups.entries()].map(([category, items]) => (
                <div key={category}>
                  <h2 className="mb-2 text-sm font-semibold text-gray-500">{category}</h2>
                  <div className="space-y-2">
                    {items.map((item) => <IngredientRow key={item.id} ingredient={item} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
