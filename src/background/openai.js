import cache from './cache';
import { getApiKey } from "./storage";
import { API, PROMPTS, MODEL } from "./contants";

export async function getSummary(chatContent, sendResponse) {
  try {
    // Check if summary already cached locally
    const cached = await cache.get(chatContent.chatId);
    if (cached && cached.summary) {
      return sendResponse({
        summary: cached.summary,
        lastUpdated: cached.lastUpdated,
        fromCache: true
      });
    }
    // Not cached -> fetching new summary
    const api_key = await getApiKey();
    const res = await fetch(`${API.OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL.NAME,
        messages: [{ role: "user", content: PROMPTS.en + JSON.stringify(chatContent) }],
        temperature: MODEL.TEMPERATURE,
        max_tokens: MODEL.MAX_TOKENS,
      })
    });
    const data = await res.json();
    if (data.error) {
      sendResponse({ error: data.error.message });
    }
    const summary = data.choices[0].message.content.trim();

    await cache.set(chatContent.chatId, summary, chatContent.messages.lenght);

    return sendResponse({
      summary,
      lastUpdated: Date.now(),
      fromCache: false
    })
  } catch (err) {

    return sendResponse({ error: err.message });
  }
}
