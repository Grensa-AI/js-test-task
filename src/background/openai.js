import { API, PROMPTS, MODEL } from "./contants";
import { getApiKey } from "./storage";
export async function getSummary(chatContent, sendResponse) {
  try {
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
    } else {
      sendResponse({ summary: data.choices[0].message.content.trim() });
    }
  } catch (err) {
    return sendResponse({ error: err.message });
  }
}
