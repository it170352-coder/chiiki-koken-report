"use client";

import { useTransition } from "react";
import type { Product } from "@/lib/types";
import { toggleProduct, deleteProduct } from "./actions";

export default function ProductRow({ product }: { product: Product }) {
  const [pending, startTransition] = useTransition();

  return (
    <tr className="border-b border-amber-50 last:border-0">
      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-gray-800">{product.name}</td>
      <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">{product.category || "—"}</td>
      <td className="whitespace-nowrap px-4 py-2.5 text-gray-700">¥{product.price.toLocaleString()}</td>
      <td className="whitespace-nowrap px-4 py-2.5">
        <button
          disabled={pending}
          onClick={() =>
            startTransition(() => toggleProduct(product.id, !product.is_active))
          }
          className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
            product.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {product.is_active ? "販売中" : "停止中"}
        </button>
      </td>
      <td className="px-4 py-2.5 text-right">
        {product.is_active ? (
          <span className="text-xs text-gray-300" title="削除するには、まず「停止中」にしてください">
            停止中で削除可
          </span>
        ) : (
          <button
            disabled={pending}
            onClick={() => {
              if (
                confirm(
                  `「${product.name}」を完全に削除します。\nこの操作は取り消せません。よろしいですか？`,
                )
              ) {
                startTransition(() => deleteProduct(product.id));
              }
            }}
            className="text-xs text-gray-400 hover:text-red-500"
          >
            削除
          </button>
        )}
      </td>
    </tr>
  );
}
