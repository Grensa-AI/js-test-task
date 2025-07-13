import cache from "../cache";
/**
 * Checks if a summary for the given chatId exists in the cache.
 * If a cached summary is found, returns an object containing the summary,
 * the last updated timestamp, and a flag indicating the data is from cache.
 * If no cached summary exists, returns null.
 *
 * @param {string} chatId - The identifier of the chat to check in the cache.
 * @returns {Promise<{summary: string, lastUpdated: string, fromCache: boolean} | null>}
 */
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
