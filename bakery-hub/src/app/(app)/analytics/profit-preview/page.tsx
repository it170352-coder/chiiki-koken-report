export default function ProfitPreviewPage() {
  const items = [
    { name: "塩パン", sales: 45, price: 180, cost: 42, revenue: 8100, costTotal: 1890, profit: 6210, margin: 76.7 },
    { name: "クロワッサン", sales: 32, price: 220, cost: 68, revenue: 7040, costTotal: 2176, profit: 4864, margin: 69.1 },
    { name: "カレーパン", sales: 28, price: 200, cost: 75, revenue: 5600, costTotal: 2100, profit: 3500, margin: 62.5 },
    { name: "食パン", sales: 15, price: 380, cost: 110, revenue: 5700, costTotal: 1650, profit: 4050, margin: 71.1 },
    { name: "あんぱん", sales: 22, price: 160, cost: 55, revenue: 3520, costTotal: 1210, profit: 2310, margin: 65.6 },
  ];
  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);
  const totalCost = items.reduce((s, i) => s + i.costTotal, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-bark-900">原価・利益分析</h1>
        <span className="rounded-full bg-bark-100 px-3 py-1 text-xs font-medium text-bark-700">プレビュー</span>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-bark-100 bg-white p-4">
          <p className="text-xs text-gray-500">本日の売上</p>
          <p className="mt-1 text-xl font-bold text-bark-900">¥{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-bark-100 bg-white p-4">
          <p className="text-xs text-gray-500">原価合計</p>
          <p className="mt-1 text-xl font-bold text-red-500">¥{totalCost.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-bark-100 bg-white p-4">
          <p className="text-xs text-gray-500">粗利益</p>
          <p className="mt-1 text-xl font-bold text-green-600">¥{totalProfit.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-bark-100 bg-white p-4">
          <p className="text-xs text-gray-500">平均利益率</p>
          <p className="mt-1 text-xl font-bold text-bark-700">{totalMargin}%</p>
        </div>
      </div>

      {/* 商品別テーブル */}
      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-700">商品別 原価・利益</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bark-100 text-xs text-gray-400">
                <th className="pb-2 text-left">商品名</th>
                <th className="pb-2 text-right">販売数</th>
                <th className="pb-2 text-right">売価</th>
                <th className="pb-2 text-right">原価/個</th>
                <th className="pb-2 text-right">売上</th>
                <th className="pb-2 text-right">原価計</th>
                <th className="pb-2 text-right">粗利</th>
                <th className="pb-2 text-right">利益率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bark-50">
              {items.map((item) => (
                <tr key={item.name}>
                  <td className="py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="py-3 text-right text-gray-600">{item.sales}個</td>
                  <td className="py-3 text-right text-gray-600">¥{item.price}</td>
                  <td className="py-3 text-right text-gray-600">¥{item.cost}</td>
                  <td className="py-3 text-right text-gray-700">¥{item.revenue.toLocaleString()}</td>
                  <td className="py-3 text-right text-red-400">¥{item.costTotal.toLocaleString()}</td>
                  <td className="py-3 text-right font-medium text-green-600">¥{item.profit.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.margin >= 70 ? "bg-green-100 text-green-700" :
                      item.margin >= 60 ? "bg-bark-100 text-bark-700" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {item.margin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-bark-200 font-semibold">
                <td className="pt-3 text-gray-800">合計</td>
                <td></td><td></td><td></td>
                <td className="pt-3 text-right text-gray-800">¥{totalRevenue.toLocaleString()}</td>
                <td className="pt-3 text-right text-red-500">¥{totalCost.toLocaleString()}</td>
                <td className="pt-3 text-right text-green-600">¥{totalProfit.toLocaleString()}</td>
                <td className="pt-3 text-right text-bark-700">{totalMargin}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 利益率ランキング */}
      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-700">利益率ランキング</h2>
        <div className="space-y-3">
          {[...items].sort((a, b) => b.margin - a.margin).map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="w-5 text-sm font-bold text-bark-400">{i + 1}</span>
              <span className="w-28 text-sm text-gray-700">{item.name}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-bark-100">
                <div
                  className="h-2 rounded-full bg-bark-400"
                  style={{ width: `${item.margin}%` }}
                />
              </div>
              <span className="w-14 text-right text-sm font-medium text-bark-700">{item.margin}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 注意アラート */}
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">⚠ 原価率が高い商品</p>
        <p className="mt-1 text-sm text-red-600">カレーパンの利益率が62.5%と低めです。仕入単価の見直しか、販売価格の調整を検討してください。</p>
      </div>
    </div>
  );
}
