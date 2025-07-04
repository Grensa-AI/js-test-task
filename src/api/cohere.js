export async function getSummary(messages, apiKey) {
  const prompt = `Проанализируй следующий диалог и сделай краткое резюме, состоящее из 2–3 предложений.
  Сфокусируйся на главных выводах или финальных договорённостях, если они есть.
  Не пересказывай каждое сообщение, не добавляй воду. Диалог: ${messages.join("\n")}`;

  const response = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "command-r",
      message: prompt,
      temperature: 0.3,
      chat_history: [],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error("Ошибка от Cohere API");
    error.code = response.status;
    error.details = data.message || data.error || "";

    console.error("Cohere API error:", {
      status: response.status,
      message: data.message,
      full: data
    });

    throw error;
  }

  return data.text;
}
