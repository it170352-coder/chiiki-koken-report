"use client";

import { useState } from "react";
import type { Product, CartItem } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/types";
import CheckoutModal from "./CheckoutModal";

type Props = {
  products: Product[];
};

export default function PosClient({ products }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("すべて");
  const [showCheckout, setShowCheckout] = useState(false);

  const activeProducts = products.filter((p) => p.is_active);

  const categories = ["すべて", ...PRODUCT_CATEGORIES.filter((c) =>
    activeProducts.some((p) => p.category === c)
  )];

  const filteredProducts =
    activeCategory === "すべて"
      ? activeProducts
      : activeProducts.filter((p) => p.category === activeCategory);

  // 税額逆算（税込価格 × 税率 / (1 + 税率)）、整数
  function calcTax(price: number, taxRate: number): number {
    return Math.floor((price * taxRate) / (1 + taxRate));
  }

  // 8%対象合計・10%対象合計
  const tax8Total = cart.reduce((sum, ci) => {
    if (Math.abs(ci.product.tax_rate - 0.08) < 0.001) {
      return sum + calcTax(ci.product.price * ci.quantity, ci.product.tax_rate);
    }
    return sum;
  }, 0);

  const tax10Total = cart.reduce((sum, ci) => {
    if (Math.abs(ci.product.tax_rate - 0.10) < 0.001) {
      return sum + calcTax(ci.product.price * ci.quantity, ci.product.tax_rate);
    }
    return sum;
  }, 0);

  const subtotal = cart.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
  const totalAmount = subtotal;

  function addToCart(product: Product) {
    if (product.stock_managed && product.stock_quantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((ci) => ci.product.id === product.id);
      if (existing) {
        return prev.map((ci) =>
          ci.product.id === product.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((ci) =>
          ci.product.id === productId
            ? { ...ci, quantity: ci.quantity + delta }
            : ci
        )
        .filter((ci) => ci.quantity > 0)
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((ci) => ci.product.id !== productId));
  }

  function clearCart() {
    setCart([]);
    setShowCheckout(false);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen gap-0 overflow-hidden">
      {/* 左側: 商品グリッド */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* カテゴリタブ */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-gray-100 bg-white px-3 py-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                activeCategory === cat
                  ? "bg-bark-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-bark-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 商品グリッド */}
        <div className="flex-1 overflow-y-auto p-3">
          {filteredProducts.length === 0 ? (
            <p className="pt-8 text-center text-sm text-gray-400">
              表示できる商品がありません
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => {
                const outOfStock =
                  product.stock_managed && product.stock_quantity <= 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    className={`relative flex flex-col rounded-xl border p-3 text-left transition active:scale-95 ${
                      outOfStock
                        ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-50"
                        : "border-bark-100 bg-white shadow-sm hover:border-bark-300 hover:shadow"
                    }`}
                  >
                    <span className="line-clamp-2 text-sm font-medium leading-tight text-gray-800">
                      {product.name}
                    </span>
                    <span className="mt-1.5 text-xs text-gray-500">{product.category}</span>
                    <span className="mt-2 text-base font-bold text-bark-700">
                      ¥{product.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round(product.tax_rate * 100)}%対象
                    </span>
                    {outOfStock && (
                      <span className="mt-1 text-xs font-medium text-red-400">在庫なし</span>
                    )}
                    {product.stock_managed && !outOfStock && (
                      <span className="mt-1 text-xs text-gray-400">
                        残 {product.stock_quantity}個
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 右側: カート */}
      <div className="flex w-64 flex-col border-l border-gray-100 bg-white sm:w-72 lg:w-80">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="font-bold text-gray-800">
            カート
            {cart.length > 0 && (
              <span className="ml-2 rounded-full bg-bark-500 px-2 py-0.5 text-xs text-white">
                {cart.reduce((s, ci) => s + ci.quantity, 0)}点
              </span>
            )}
          </h2>
        </div>

        {/* カートアイテム一覧 */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="pt-12 text-center text-sm text-gray-400">
              商品をタップして<br />カートに追加
            </p>
          ) : (
            <ul className="divide-y divide-gray-50 px-3 py-2">
              {cart.map((ci) => (
                <li key={ci.product.id} className="py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {ci.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ¥{ci.product.price.toLocaleString()} ×{" "}
                        {Math.round(ci.product.tax_rate * 100)}%
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(ci.product.id)}
                      className="text-gray-300 hover:text-red-400"
                      aria-label="削除"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(ci.product.id, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:border-bark-400"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(ci.product.id, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:border-bark-400"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      ¥{(ci.product.price * ci.quantity).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 合計・消費税内訳 */}
        <div className="border-t border-gray-100 px-4 py-3 space-y-1">
          {tax8Total > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>消費税（8%）</span>
              <span>¥{tax8Total.toLocaleString()}</span>
            </div>
          )}
          {tax10Total > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>消費税（10%）</span>
              <span>¥{tax10Total.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-medium text-gray-700">合計（税込）</span>
            <span className="text-xl font-bold text-bark-900">
              ¥{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 会計ボタン */}
        <div className="px-4 pb-4 pt-2 space-y-2">
          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full rounded-xl bg-bark-600 py-3.5 text-base font-bold text-white shadow-sm hover:bg-bark-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            会計する
          </button>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="w-full rounded-xl border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              カートをクリア
            </button>
          )}
        </div>
      </div>

      {/* 会計モーダル */}
      {showCheckout && (
        <CheckoutModal
          cartItems={cart}
          totalAmount={totalAmount}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
