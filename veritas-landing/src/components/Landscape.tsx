/**
 * Hand-drawn vector landscape for the hero: soft olive hills under a warm
 * parchment sky, with amber meadows instead of photographic flowers.
 * Pure SVG keeps it sharp at any size and costs only a few kilobytes.
 */
export function Landscape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 170 1440 390" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ls-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfc597" />
          <stop offset="1" stopColor="#9fab72" />
        </linearGradient>
        <linearGradient id="ls-mid" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#a6b97c" />
          <stop offset="0.55" stopColor="#7f9a52" />
          <stop offset="1" stopColor="#5f7d38" />
        </linearGradient>
        <linearGradient id="ls-near" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#93ad62" />
          <stop offset="0.5" stopColor="#6a8a40" />
          <stop offset="1" stopColor="#456527" />
        </linearGradient>
        <linearGradient id="ls-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d9a4c" />
          <stop offset="1" stopColor="#3f5e22" />
        </linearGradient>
        <radialGradient id="ls-shine" cx="0.35" cy="0.15" r="0.6">
          <stop offset="0" stopColor="#f3e6c4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f3e6c4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ls-meadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d59a4a" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#c58940" stopOpacity="0.25" />
          <stop offset="1" stopColor="#c58940" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Far ridge */}
      <path d="M0 292C150 246 296 226 442 258s286 52 430 4 292-70 418-34c66 19 116 40 150 52V560H0Z" fill="url(#ls-far)" />
      {/* Tree line on the far ridge */}
      <g fill="#6f7f4a" opacity="0.75">
        <circle cx="1130" cy="222" r="11" />
        <circle cx="1146" cy="216" r="14" />
        <circle cx="1164" cy="223" r="10" />
        <circle cx="1218" cy="232" r="8" />
        <circle cx="1232" cy="227" r="11" />
        <circle cx="236" cy="246" r="9" />
        <circle cx="250" cy="241" r="12" />
      </g>

      {/* Middle hills */}
      <path d="M-40 368C110 262 330 248 520 330c80 34 132 72 190 112V560H-40Z" fill="url(#ls-mid)" />
      <path d="M-40 368C110 262 330 248 520 330c80 34 132 72 190 112V560H-40Z" fill="url(#ls-shine)" />
      <path d="M740 432c120-96 300-150 486-134 112 10 186 40 254 66V560H740Z" fill="url(#ls-mid)" />
      <path d="M740 432c120-96 300-150 486-134 112 10 186 40 254 66V560H740Z" fill="url(#ls-shine)" />

      {/* Amber meadows */}
      <ellipse cx="150" cy="420" rx="120" ry="16" fill="url(#ls-meadow)" />
      <ellipse cx="1250" cy="392" rx="150" ry="18" fill="url(#ls-meadow)" />

      {/* Near hills */}
      <path d="M-60 474c140-92 320-112 482-52 98 36 176 82 236 138H-60Z" fill="url(#ls-near)" />
      <path d="M-60 474c140-92 320-112 482-52 98 36 176 82 236 138H-60Z" fill="url(#ls-shine)" />
      <path d="M800 560c86-90 230-150 396-142 118 6 204 44 284 88V560Z" fill="url(#ls-near)" />
      <path d="M800 560c86-90 230-150 396-142 118 6 204 44 284 88V560Z" fill="url(#ls-shine)" />

      <ellipse cx="1040" cy="512" rx="130" ry="14" fill="url(#ls-meadow)" opacity="0.8" />
      <ellipse cx="300" cy="520" rx="110" ry="12" fill="url(#ls-meadow)" opacity="0.7" />

      {/* Front valley */}
      <path d="M380 560c140-92 322-112 504-80 98 17 160 48 198 80Z" fill="url(#ls-front)" />
    </svg>
  );
}
