/**
 * AmplyGo icon mark — a rounded white "A" peak + a tech-green play triangle,
 * side by side (matches the brand icon). Vector, so it stays crisp at any size.
 */
export default function AmplyMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 140) / 240} viewBox="0 0 240 140" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="amplyPlay" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34e57e" />
          <stop offset="1" stopColor="#1fbf63" />
        </linearGradient>
      </defs>
      {/* A / peak */}
      <path
        d="M24 118 L74 40 Q84 25 94 40 L144 118"
        stroke="white"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Green play */}
      <path
        d="M164 55 L206 79 L164 103 Z"
        fill="url(#amplyPlay)"
        stroke="url(#amplyPlay)"
        strokeWidth="9"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
