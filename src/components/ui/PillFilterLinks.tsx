import Link from "next/link";

export default function PillFilterLinks({
  basePath,
  paramName,
  current,
  options,
}: {
  basePath: string;
  paramName: string;
  current: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <Link
          key={opt.value}
          href={opt.value === "all" ? basePath : `${basePath}?${paramName}=${opt.value}`}
          className={`pill ${current === opt.value ? "pill-active" : ""}`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}
