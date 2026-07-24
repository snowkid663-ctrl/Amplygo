export function Card({
  children,
  style,
  className = "",
  hero = false,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hero?: boolean;
}) {
  return (
    <div className={`${hero ? "card-hero" : "card"} ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline)", fontSize: 14, fontWeight: 600 }}>
      {children}
    </div>
  );
}
