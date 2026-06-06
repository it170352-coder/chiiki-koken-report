"use client";

import { useState } from "react";

export default function ShopLink({ storeId }: { storeId: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/shop/${storeId}`);

  // ブラウザでは絶対URL（https://.../shop/xxx）にする
  if (typeof window !== "undefined" && url.startsWith("/")) {
    setUrl(`${window.location.origin}/shop/${storeId}`);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus:border-bark-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700"
        >
          {copied ? "コピーしました" : "コピー"}
        </button>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-bark-700 hover:underline"
      >
        予約ページを開く ›
      </a>
    </div>
  );
}
