/**
 * Retrieves the OpenAI API key from chrome.storage.sync.
 *
 * Returns a promise that resolves with the API key string if found,
 * or rejects with an error if there is a storage error or the key is missing.
 *
 * @returns {Promise<string>} The stored OpenAI API key.
 */
export function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("openai_api_key", (result) => {
      const key = result.openai_api_key;
      if (chrome.runtime.lastError) {
        reject(new Error("Storage error: " + chrome.runtime.lastError.message));
      } else if (!key) {
        reject(new Error("Missing OpenAI API key"));
      } else {
        resolve(key);
      }
    });
  });
}
