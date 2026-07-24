type Tone = "green" | "amber" | "red" | "neutral" | "teal" | "pink";

export default function Badge({
  children,
  tone = "neutral",
  small = false,
}: {
  children: React.ReactNode;
  tone?: Tone;
  small?: boolean;
}) {
  return <span className={`badge badge-${tone} ${small ? "badge-sm" : ""}`}>{children}</span>;
}
