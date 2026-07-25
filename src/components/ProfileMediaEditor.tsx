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
  bannerPos = 50,
  avatarShape = "circle",
}: {
  name: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bannerPos?: number;
  avatarShape?: "circle" | "rounded";
}) {
  const router = useRouter();
  const { update } = useSession();
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"avatar" | "banner" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reposition state (local until saved).
  const [repositioning, setRepositioning] = useState(false);
  const [pos, setPos] = useState(bannerPos);
  const dragging = useRef(false);

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
    setRepositioning(false);
    router.refresh();
    if (kind === "avatar") await update(); // refresh the topbar avatar
  }

  function pointerToPos(clientY: number) {
    const el = bannerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientY - rect.top) / rect.height) * 100;
    setPos(Math.max(0, Math.min(100, Math.round(p))));
  }

  async function savePos() {
    setBusy("banner");
    const res = await fetch("/api/profile/image", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerPos: pos }),
    });
    setBusy(null);
    setRepositioning(false);
    if (res.ok) router.refresh();
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
          ref={bannerRef}
          className={`profile-banner ${repositioning ? "profile-banner-repositioning" : ""}`}
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundPosition: `center ${pos}%` } : undefined}
          onPointerDown={(e) => {
            if (!repositioning) return;
            dragging.current = true;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            pointerToPos(e.clientY);
          }}
          onPointerMove={(e) => {
            if (repositioning && dragging.current) pointerToPos(e.clientY);
          }}
          onPointerUp={() => (dragging.current = false)}
        >
          {repositioning && <div className="profile-banner-repohint">Drag to reposition</div>}
          <div className="profile-banner-actions">
            {repositioning ? (
              <>
                <button type="button" className="media-btn media-btn-primary" onClick={savePos} disabled={busy === "banner"}>
                  {busy === "banner" ? "Saving…" : "Save position"}
                </button>
                <button type="button" className="media-btn" onClick={() => { setPos(bannerPos); setRepositioning(false); }}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button type="button" className="media-btn" onClick={() => bannerInput.current?.click()} disabled={busy === "banner"}>
                  {busy === "banner" ? "Uploading…" : bannerUrl ? "Change banner" : "Add banner"}
                </button>
                {bannerUrl && (
                  <button type="button" className="media-btn" onClick={() => setRepositioning(true)}>
                    Reposition
                  </button>
                )}
                {bannerUrl && (
                  <button type="button" className="media-btn" onClick={() => remove("banner")} disabled={busy === "banner"}>
                    Remove
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="profile-avatar-row">
          <button
            type="button"
            className={`profile-avatar ${avatarShape === "rounded" ? "profile-avatar-rounded" : ""}`}
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
            onClick={() => avatarInput.current?.click()}
            disabled={busy === "avatar"}
            title={avatarUrl ? "Change photo" : "Add photo"}
          >
            {!avatarUrl && <span>{initialsFrom(name)}</span>}
            <span className="profile-avatar-overlay">
              {busy === "avatar" ? (
                "…"
              ) : (
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </span>
          </button>
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
