import { listTrackableYouTubeSubmissions, recordVideoStats } from "./data";
import { fetchYouTubeStats, youtubeStatsEnabled } from "./youtube";

/**
 * Refreshes real engagement stats for all trackable videos and stores a
 * snapshot per video. Safe to run on a schedule (Render cron) or on demand.
 * Returns a small summary for logging.
 */
export async function refreshYouTubeStats(): Promise<{ enabled: boolean; checked: number; updated: number }> {
  if (!youtubeStatsEnabled()) return { enabled: false, checked: 0, updated: 0 };

  const subs = await listTrackableYouTubeSubmissions();
  if (subs.length === 0) return { enabled: true, checked: 0, updated: 0 };

  const ids = subs.map((s) => s.externalVideoId);
  const stats = await fetchYouTubeStats(ids);

  let updated = 0;
  for (const sub of subs) {
    const s = stats.get(sub.externalVideoId);
    if (!s) continue;
    await recordVideoStats(sub.id, s);
    updated++;
  }
  return { enabled: true, checked: subs.length, updated };
}
