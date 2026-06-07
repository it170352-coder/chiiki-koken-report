"use client";

import CsvDownloadButton from "@/components/CsvDownloadButton";

type Props = {
  dailySeries: { date: string; sales: number }[];
  productRanking: { name: string; qty: number; sales: number }[];
  from: string;
  to: string;
};

export default function SalesCsvButton({ dailySeries, productRanking, from, to }: Props) {
  const rows = dailySeries.map((d) => [d.date, d.sales]);
  return (
    <CsvDownloadButton
      filename={`売上データ_${from}_${to}.csv`}
      headers={["日付", "売上（円）"]}
      rows={rows}
      label="売上CSV"
    />
  );
}
