import type { AdminEnv } from "./request-context";

/**
 * Ask the web worker to purge cached pages by tag after content changes.
 * Skips silently (with a warning) when not configured, e.g. local dev.
 * Never throws: the content write already succeeded, a purge failure must
 * not fail the save. Failures surface in worker logs.
 */
export async function purgeWebCache(env: AdminEnv, tags: string[]): Promise<void> {
  const origin = env.WEB_ORIGIN;
  const secret = env.PURGE_SECRET;
  if (!origin || !secret) {
    console.warn("purgeWebCache: WEB_ORIGIN or PURGE_SECRET unset, skipping");
    return;
  }
  try {
    const response = await fetch(`${origin}/api/internal/purge`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ tags }),
    });
    if (!response.ok) {
      console.error(
        `purgeWebCache: purge failed with ${response.status}: ${await response.text()}`,
      );
    }
  } catch (error) {
    console.error(`purgeWebCache: purge request failed: ${String(error)}`);
  }
}
