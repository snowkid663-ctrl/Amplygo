"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileMediaEditor({
  name,
  avatarUrl,
  bannerUrl,
  avatarShape = "circle",
}: {
  name: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  avatarShape?: "circle" | "rounded";
}) {
  const router = useRouter();
  const { update } = useSession();
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"avatar" | "banner" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(kind: "avatar" | "banner", file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(kind);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const res = await fetch("/api/profile/image", { method: "POST", body: fd });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Upload failed");
      return;
    }
    router.refresh();
    if (kind === "avatar") await update(); // refresh the topbar avatar
  }

  async function remove(kind: "avatar" | "banner") {
    setError(null);
    setBusy(kind);
    await fetch("/api/profile/image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    setBusy(null);
    router.refresh();
    if (kind === "avatar") await update(); // refresh the topbar avatar
  }

  return (
    <div>
      <input
        ref={avatarInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => upload("avatar", e.target.files?.[0])}
      />
      <input
        ref={bannerInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => upload("banner", e.target.files?.[0])}
      />

      <div className="profile-media">
        <div
          className="profile-banner"
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
        >
          <div className="profile-banner-actions">
            <button type="button" className="media-btn" onClick={() => bannerInput.current?.click()} disabled={busy === "banner"}>
              {busy === "banner" ? "Uploading…" : bannerUrl ? "Change banner" : "Add banner"}
            </button>
            {bannerUrl && (
              <button type="button" className="media-btn" onClick={() => remove("banner")} disabled={busy === "banner"}>
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="profile-avatar-row">
          <div
            className={`profile-avatar ${avatarShape === "rounded" ? "profile-avatar-rounded" : ""}`}
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {!avatarUrl && <span>{initialsFrom(name)}</span>}
            <button
              type="button"
              className="avatar-camera"
              title={avatarUrl ? "Change photo" : "Add photo"}
              onClick={() => avatarInput.current?.click()}
              disabled={busy === "avatar"}
            >
              {busy === "avatar" ? "…" : "📷"}
            </button>
          </div>
          <div className="profile-avatar-hint">
            <button type="button" className="media-link" onClick={() => avatarInput.current?.click()} disabled={busy === "avatar"}>
              {avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {avatarUrl && (
              <button type="button" className="media-link" onClick={() => remove("avatar")} disabled={busy === "avatar"}>
                Remove
              </button>
            )}
            <span className="profile-avatar-note">PNG, JPEG, WebP or GIF · up to 4 MB</span>
          </div>
        </div>
      </div>

      {error && <div className="alert-error fu" style={{ marginTop: 12 }}>{error}</div>}
    </div>
  );
}
