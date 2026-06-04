"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";

const REVEAL = 88; // 削除ボタンの幅(px)

export default function SwipeToDelete({
  onDelete,
  confirmLabel = "削除",
  children,
}: {
  onDelete: () => Promise<void>;
  confirmLabel?: string;
  children: ReactNode;
}) {
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const startX = useRef(0);
  const moved = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    if (pending) return;
    setDragging(true);
    moved.current = false;
    startX.current = e.clientX;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const delta = e.clientX - startX.current;
    // 一定以上動いた時だけ「スワイプ」と判定し、ポインタを掴む（タップ＝リンク遷移は妨げない）
    if (!moved.current && Math.abs(delta) > 6) {
      moved.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!moved.current) return;
    const base = open ? -REVEAL : 0;
    const next = Math.min(0, Math.max(-REVEAL, base + delta));
    setDx(next);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    const shouldOpen = dx <= -REVEAL / 2;
    setOpen(shouldOpen);
    setDx(shouldOpen ? -REVEAL : 0);
  }

  function onClickCapture(e: React.MouseEvent) {
    // スワイプ操作だった場合は、子要素のクリック(リンク遷移など)を打ち消す
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => onDelete())}
          className="w-[88px] bg-red-500 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
        >
          {pending ? "削除中…" : confirmLabel}
        </button>
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
        className="relative touch-pan-y bg-white"
      >
        {children}
      </div>
    </div>
  );
}
