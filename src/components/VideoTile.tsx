import type { CSSProperties } from "react";
import type { Platform } from "@/lib/types";
import PlatformIcon from "./PlatformIcon";

/** A stylized vertical "video" thumbnail (creator content placeholder). */
export default function VideoTile({
  grad,
  views,
  platform,
  className = "",
  style,
}: {
  grad: number;
  views: string;
  platform: Platform;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`vtile vg${grad} ${className}`} style={style} aria-hidden="true">
      <div className="vtop">
        <PlatformIcon platform={platform} size={15} />
      </div>
      <div className="vplay">
        <svg width={13} height={13} viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <div className="vmeta">
        <span>▶ {views}</span>
        <span>♥</span>
      </div>
    </div>
  );
}
