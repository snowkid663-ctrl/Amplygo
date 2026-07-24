import VideoTile from "./VideoTile";
import type { Platform } from "@/lib/types";

type Tile = { grad: number; views: string; platform: Platform };

const ROW_A: Tile[] = [
  { grad: 1, views: "1.2M", platform: "TIKTOK" },
  { grad: 2, views: "204K", platform: "INSTAGRAM_REELS" },
  { grad: 3, views: "48K", platform: "YOUTUBE_SHORTS" },
  { grad: 4, views: "820K", platform: "TIKTOK" },
  { grad: 5, views: "3.1M", platform: "INSTAGRAM_REELS" },
  { grad: 6, views: "76K", platform: "YOUTUBE_SHORTS" },
  { grad: 2, views: "512K", platform: "TIKTOK" },
  { grad: 1, views: "2.4M", platform: "INSTAGRAM_REELS" },
];
const ROW_B: Tile[] = [
  { grad: 4, views: "94K", platform: "YOUTUBE_SHORTS" },
  { grad: 6, views: "640K", platform: "TIKTOK" },
  { grad: 3, views: "31K", platform: "INSTAGRAM_REELS" },
  { grad: 5, views: "1.8M", platform: "YOUTUBE_SHORTS" },
  { grad: 1, views: "418K", platform: "TIKTOK" },
  { grad: 2, views: "5.2M", platform: "INSTAGRAM_REELS" },
  { grad: 4, views: "12K", platform: "YOUTUBE_SHORTS" },
  { grad: 6, views: "355K", platform: "TIKTOK" },
];

function Row({ items, reverse }: { items: Tile[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee">
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        {doubled.map((t, i) => (
          <VideoTile key={i} grad={t.grad} views={t.views} platform={t.platform} />
        ))}
      </div>
    </div>
  );
}

/** Two infinite rows of creator videos scrolling in opposite directions. */
export default function VideoCarousel() {
  return (
    <div className="vcarousel">
      <Row items={ROW_A} />
      <Row items={ROW_B} reverse />
    </div>
  );
}
