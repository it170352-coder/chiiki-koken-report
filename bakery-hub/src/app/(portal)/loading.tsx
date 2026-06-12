export default function PortalLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 via-sky-50 to-white">
      <style>{loadingStyles}</style>

      <div
        className="relative flex h-44 w-44 items-end justify-center"
        role="img"
        aria-label="読み込み中"
      >
        {/* Zzz（眠っているあいだ立ちのぼる） */}
        <div className="slp-zzz absolute right-5 top-3 select-none font-bold text-indigo-400">
          <span className="slp-z slp-z1 absolute text-base">Z</span>
          <span className="slp-z slp-z2 absolute text-xl">Z</span>
          <span className="slp-z slp-z3 absolute text-2xl">Z</span>
        </div>

        {/* 目覚めのびっくりマーク */}
        <div className="slp-wake absolute left-8 top-4 text-lg font-bold text-amber-400">!</div>

        {/* 猫 */}
        <svg className="slp-body" width="150" height="150" viewBox="0 0 120 120" fill="none">
          {/* 影 */}
          <ellipse cx="60" cy="110" rx="42" ry="6" fill="#c7d2fe" opacity="0.6" />

          {/* しっぽ（体の前に巻きつく） */}
          <path
            d="M94 96 C116 92 116 60 96 62"
            stroke="#a5b4fc"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />

          {/* 丸まった体 */}
          <ellipse cx="60" cy="92" rx="44" ry="20" fill="#c7d2fe" />

          {/* 耳 */}
          <path d="M38 40 L33 16 L56 33 Z" fill="#a5b4fc" />
          <path d="M82 40 L87 16 L64 33 Z" fill="#a5b4fc" />
          <path d="M40 36 L37 23 L50 33 Z" fill="#f9a8d4" />
          <path d="M80 36 L83 23 L70 33 Z" fill="#f9a8d4" />

          {/* 頭 */}
          <circle cx="60" cy="58" r="27" fill="#c7d2fe" />

          {/* 模様 */}
          <path d="M60 31 v10" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
          <path d="M52 33 l-2 9" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
          <path d="M68 33 l2 9" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />

          {/* マズル */}
          <ellipse cx="51" cy="66" rx="9" ry="7" fill="#e0e7ff" />
          <ellipse cx="69" cy="66" rx="9" ry="7" fill="#e0e7ff" />

          {/* 目（閉じている＝睡眠中） */}
          <g className="slp-eyes-closed" stroke="#4338ca" strokeWidth="2.4" strokeLinecap="round" fill="none">
            <path d="M44 58 q5 5 10 0" />
            <path d="M66 58 q5 5 10 0" />
          </g>
          {/* 目（開いている＝目覚め） */}
          <g className="slp-eyes-open" fill="#312e81">
            <ellipse cx="49" cy="57" rx="3.4" ry="4.4" />
            <ellipse cx="71" cy="57" rx="3.4" ry="4.4" />
          </g>

          {/* 鼻 */}
          <path d="M57 65 h6 l-3 3 Z" fill="#f472b6" />
          {/* 口（あくび） */}
          <ellipse className="slp-mouth" cx="60" cy="72" rx="3" ry="2.5" fill="#be586f" />

          {/* ひげ */}
          <g stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round">
            <path d="M42 66 L26 62" />
            <path d="M42 69 L26 70" />
            <path d="M78 66 L94 62" />
            <path d="M78 69 L94 70" />
          </g>
        </svg>
      </div>

      <p className="mt-2 text-xs font-medium uppercase tracking-widest text-indigo-400">
        RaidQ Portal
      </p>
      <p className="mt-1 text-sm text-gray-500">準備しています…</p>
    </div>
  );
}

const loadingStyles = `
.slp-body {
  transform-origin: 60px 108px;
  animation: slp-cycle 5s ease-in-out infinite;
}
@keyframes slp-cycle {
  0%, 50%   { transform: translateY(0) scale(1); }
  20%       { transform: translateY(-1px) scale(1.015); }   /* 寝息 */
  40%       { transform: translateY(0) scale(1); }
  64%       { transform: translateY(-12px) scale(1.05); }   /* 伸びをして起きる */
  78%       { transform: translateY(-8px) scale(1.03); }
  92%, 100% { transform: translateY(0) scale(1); }           /* またウトウト */
}

.slp-eyes-closed { animation: slp-eyes-closed 5s ease-in-out infinite; }
.slp-eyes-open   { animation: slp-eyes-open   5s ease-in-out infinite; }
@keyframes slp-eyes-closed {
  0%, 58%   { opacity: 1; }
  63%, 88%  { opacity: 0; }
  93%, 100% { opacity: 1; }
}
@keyframes slp-eyes-open {
  0%, 58%   { opacity: 0; }
  63%, 88%  { opacity: 1; }
  93%, 100% { opacity: 0; }
}

.slp-mouth { animation: slp-mouth 5s ease-in-out infinite; transform-origin: 60px 72px; }
@keyframes slp-mouth {
  0%, 60%   { transform: scale(1); }
  66%, 86%  { transform: scale(1.5, 2); }   /* 起きてあくび */
  92%, 100% { transform: scale(1); }
}

.slp-zzz { animation: slp-zzz 5s ease-in-out infinite; }
@keyframes slp-zzz {
  0%, 56%   { opacity: 1; }
  62%, 90%  { opacity: 0; }
  96%, 100% { opacity: 1; }
}
.slp-z { opacity: 0; }
.slp-z1 { animation: slp-float 2.4s ease-in-out infinite; }
.slp-z2 { animation: slp-float 2.4s ease-in-out infinite 0.5s; right: 10px; }
.slp-z3 { animation: slp-float 2.4s ease-in-out infinite 1s; right: 20px; }
@keyframes slp-float {
  0%   { opacity: 0; transform: translateY(0) scale(0.6); }
  25%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-26px) scale(1.1); }
}

.slp-wake { opacity: 0; animation: slp-wake 5s ease-in-out infinite; }
@keyframes slp-wake {
  0%, 60%   { opacity: 0; transform: scale(0.4) translateY(4px); }
  66%       { opacity: 1; transform: scale(1.1) translateY(0); }
  84%       { opacity: 1; transform: scale(1) translateY(0); }
  90%, 100% { opacity: 0; transform: scale(0.6) translateY(2px); }
}

@media (prefers-reduced-motion: reduce) {
  .slp-body, .slp-eyes-closed, .slp-eyes-open, .slp-mouth, .slp-zzz, .slp-z, .slp-wake {
    animation: none;
  }
  .slp-eyes-open, .slp-wake { opacity: 0; }
  .slp-z { opacity: 1; }
}
`;
