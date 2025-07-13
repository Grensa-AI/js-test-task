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
