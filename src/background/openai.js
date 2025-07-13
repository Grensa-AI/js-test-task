import { API, PROMPTS } from "./contants";
export async function getSummary(chatContent, sendResponse) {
  try {
    const res = await fetch(`${API.OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${API.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: PROMPTS.en + JSON.stringify(chatContent) }],
        temperature: 0.7,
        max_tokens: 500,
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
