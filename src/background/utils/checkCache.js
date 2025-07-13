import cache from "../cache";

export async function checkCache(chatId) {
  const cached = await cache.get(chatId);
  if (cached && cached.summary) {
    return {
      summary: cached.summary,
      lastUpdated: cached.lastUpdated,
      fromCache: true
    };
  }
  return null;
}
