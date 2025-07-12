class ChatSummaryCache {

  static makeKey(chatId) {
    return `chat_${chatId}`;
  }
  // You can pass chrome.storage.sync instead of local if desired
  constructor(storage = chrome.storage.local) {
    this.storage = storage;
  }

  async get(chatId) {
    const key = ChatSummaryCache.makeKey(chatId);
    return new Promise((resolve) => {
      this.storage.get(key, (result) => {
        resolve(result[key] || null);
      });
    });
  }

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
