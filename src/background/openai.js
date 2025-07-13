import { checkCache } from './utils/checkCache';
import { fetchAndCacheSummary } from './utils/fetchAndCacheSummary';

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
