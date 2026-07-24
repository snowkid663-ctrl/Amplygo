export default function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{title}</div>
      {subtitle && <div style={{ maxWidth: 340 }}>{subtitle}</div>}
      {action}
    </div>
  );
}
