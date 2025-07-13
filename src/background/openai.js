import { checkCache } from './utils/checkCache';
import { fetchAndCacheSummary } from './utils/fetchAndCacheSummary';
/**
 * Retrieves a summary for the given chat content.
 * 
 * If forceRefresh is false, attempts to return a cached summary first.
 * If no cached summary is found or forceRefresh is true,
 * fetches a fresh summary from the API, caches it, and returns it.
 * 
 * Errors during the process are caught and returned in the response.
 * 
 * @param {Object} chatContent - The chat data to summarize.
 * @param {Function} sendResponse - Callback to send the summary or error back.
 * @param {boolean} [forceRefresh=false] - If true, bypasses cache and fetches fresh summary.
 * @returns {Promise<void>}
 */
export async function getSummary(chatContent, sendResponse, forceRefresh = false) {
  try {
    if (!forceRefresh) {
      const cached = await checkCache(chatContent.chatId);
      if (cached) {
        return sendResponse(cached);
      }
    }

    const fresh = await fetchAndCacheSummary(chatContent);
    return sendResponse(fresh);

  } catch (err) {
    return sendResponse({ error: err.message });
  }
}
