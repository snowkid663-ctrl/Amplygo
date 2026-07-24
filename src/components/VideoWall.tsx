import VideoTile from "./VideoTile";
import type { Platform } from "@/lib/types";

const PLATFORMS: Platform[] = ["TIKTOK", "INSTAGRAM_REELS", "YOUTUBE_SHORTS"];
const VIEWS = ["12.4K", "204K", "1.2M", "48K", "820K", "3.1M", "76K", "512K", "18K", "2.4M", "94K", "640K", "31K", "1.8M"];

/** A wall of stylized creator videos — deterministic so SSR and client match. */
export default function VideoWall({ count = 14 }: { count?: number }) {
  return (
    <div className="video-wall">
      {Array.from({ length: count }).map((_, i) => (
        <VideoTile
          key={i}
          grad={(i % 6) + 1}
          views={VIEWS[i % VIEWS.length]}
          platform={PLATFORMS[i % PLATFORMS.length]}
          className="floaty"
          style={{ animationDelay: `${(i % 5) * 0.6}s` }}
        />
      ))}
    </div>
  );
}
