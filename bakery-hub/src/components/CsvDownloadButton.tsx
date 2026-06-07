"use client";

type Props = {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  label?: string;
};

export default function CsvDownloadButton({ filename, headers, rows, label = "CSVダウンロード" }: Props) {
  function handleDownload() {
    const bom = "﻿";
    const lines = [headers, ...rows].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    );
    const blob = new Blob([bom + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="rounded-lg border border-bark-300 px-3 py-1.5 text-sm font-medium text-bark-700 hover:bg-bark-50"
    >
      ⬇ {label}
    </button>
  );
}
