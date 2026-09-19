import { getStore } from "@netlify/blobs";

const local = new Map<string, unknown>();

function hasNetlifyBlobs() {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
}

/**
 * Netlify Blobs is used in production so all visitors see the same room.
 * The in-process fallback keeps local development simple and does not hide
 * deployment configuration errors on Netlify.
 */
export async function readPersistent<T>(key: string, fallback: T): Promise<T> {
  if (!hasNetlifyBlobs()) return (local.get(key) as T | undefined) ?? fallback;
  const value = await getStore("vivi-wedding-game").get(key, { type: "json" }) as T | null;
  return value ?? fallback;
}

export async function writePersistent<T>(key: string, value: T) {
  if (!hasNetlifyBlobs()) {
    local.set(key, value);
    return;
  }
  await getStore("vivi-wedding-game").setJSON(key, value);
}
