/**
 * YouTube stats (Phase 1 of real tracking).
 *
 * Public video statistics (views/likes/comments) are available from the
 * YouTube Data API v3 with a simple API key — no per-creator OAuth needed.
 * Set YOUTUBE_API_KEY in the environment; without it, tracking is a no-op.
 */

export interface VideoStats {
  views: number;
  likes: number | null;
  comments: number | null;
}

/** True when a YouTube API key is configured. */
export function youtubeStatsEnabled(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

/** Extracts a YouTube video id from watch / youtu.be / shorts / embed URLs. */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/, // watch?v=ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/, // youtu.be/ID
    /\/shorts\/([a-zA-Z0-9_-]{11})/, // /shorts/ID
    /\/embed\/([a-zA-Z0-9_-]{11})/, // /embed/ID
    /\/v\/([a-zA-Z0-9_-]{11})/, // /v/ID
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/**
 * Fetches statistics for up to 50 video ids per request (the API max).
 * Returns a Map keyed by video id. Missing/private videos are simply absent.
 */
export async function fetchYouTubeStats(ids: string[]): Promise<Map<string, VideoStats>> {
  const key = process.env.YOUTUBE_API_KEY;
  const out = new Map<string, VideoStats>();
  if (!key || ids.length === 0) return out;

  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${batch.join(",")}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) continue;
    const json = (await res.json()) as { items?: { id: string; statistics?: Record<string, string> }[] };
    for (const item of json.items ?? []) {
      const s = item.statistics ?? {};
      out.set(item.id, {
        views: Number(s.viewCount ?? 0),
        likes: s.likeCount != null ? Number(s.likeCount) : null,
        comments: s.commentCount != null ? Number(s.commentCount) : null,
      });
    }
  }
  return out;
}
