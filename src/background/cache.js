/**
 * ChatSummaryCache class manages caching chat summaries
 * in browser storage (default is chrome.storage.local).
 * 
 * Each cached entry is stored under a key derived from the chat ID.
 * Provides asynchronous methods to get and set cached summaries.
 */
class ChatSummaryCache {

  /**
   * Creates a storage key string based on chatId.
   * @param {string} chatId - Unique identifier for a chat.
   * @returns {string} The storage key.
   */
  static makeKey(chatId) {
    return `chat_${chatId}`;
  }

  /**
   * Creates a new ChatSummaryCache instance.
   * @param {object} storage - Storage API (chrome.storage.local by default).
   */
  constructor(storage = chrome.storage.local) {
    this.storage = storage;
  }

  /**
   * Retrieves cached data for the specified chatId.
   * @param {string} chatId - Unique identifier for a chat.
   * @returns {Promise<object|null>} The cached data object or null if none.
   */
  async get(chatId) {
    const key = ChatSummaryCache.makeKey(chatId);
    return new Promise((resolve) => {
      this.storage.get(key, (result) => {
        resolve(result[key] || null);
      });
    });
  }

  /**
   * Stores summary data for a given chatId in storage.
   * @param {string} chatId - Unique identifier for a chat.
   * @param {string} summary - Summary text to cache.
   * @param {number} messageCount - Number of messages in the chat.
   * @returns {Promise<void>} Resolves when the data is saved.
   */
  async set(chatId, summary, messageCount) {
    const key = ChatSummaryCache.makeKey(chatId);
    const data = {
      summary,
      messageCount,
      lastUpdated: Date.now(),
    };
    return new Promise((resolve) => {
      this.storage.set({ [key]: data }, () => {
        resolve();
      });
    });
  }
}

export default new ChatSummaryCache();
