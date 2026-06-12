# -*- coding: utf-8 -*-
"""チラシのLucideラインアイコンを透過PNGに変換する（PPTX用）。
SVGラスタライザが無い環境向けに Chrome headless でレンダリングする。
出力: icons/*.png （緑=#2c8159、メールのみ #f2a279）
"""
import os
import subprocess
import tempfile

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
PX = 240  # 出力解像度（高めにしてPPTXで縮小）

GREEN = "#2c8159"
CORAL = "#f2a279"

# (name, color, inner_svg)  ※ viewBox は 0 0 24 24 固定
ICONS = {
    # 課題セクション
    "p_store":   (GREEN, '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>'),
    "p_trend":   (GREEN, '<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/>'),
    "p_search":  (GREEN, '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    "p_clock":   (GREEN, '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    "p_mega":    (GREEN, '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>'),
    "p_usearch": (GREEN, '<circle cx="10" cy="7" r="4"/><path d="M10.3 15H7a4 4 0 0 0-4 4v2"/><circle cx="17" cy="17" r="3"/><path d="m21 21-1.9-1.9"/>'),
    # メリットセクション
    "m_pin":     (GREEN, '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>'),
    "m_send":    (GREEN, '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>'),
    "m_search":  (GREEN, '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    "m_tag":     (GREEN, '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>'),
    "m_brief":   (GREEN, '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect x="2" y="6" width="20" height="14" rx="2"/>'),
    # 連絡先
    "mail":      (CORAL, '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
}

HTML_TMPL = """<!doctype html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;padding:0;background:transparent}}
svg{{width:{px}px;height:{px}px;display:block;color:{color}}}
</style></head><body>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{inner}</svg>
</body></html>"""


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, (color, inner) in ICONS.items():
        html = HTML_TMPL.format(px=PX, color=color, inner=inner)
        with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
            f.write(html)
            html_path = f.name
        out_png = os.path.join(OUT_DIR, name + ".png")
        subprocess.run([
            CHROME, "--headless", "--disable-gpu",
            "--default-background-color=00000000",
            "--force-device-scale-factor=1",
            "--hide-scrollbars",
            "--window-size={0},{0}".format(PX),
            "--screenshot=" + out_png,
            "file://" + html_path,
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        os.unlink(html_path)
        print("written:", out_png)


if __name__ == "__main__":
    main()
