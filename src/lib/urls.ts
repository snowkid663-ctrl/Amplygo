/** Absolute base URL of the app (for links shown/shared to users). */
export function appBaseUrl(): string {
  const base = process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";
  return base.replace(/\/$/, "");
}
