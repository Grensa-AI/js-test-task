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

  if (!response.ok) {
    throw new Error("Ошибка от Cohere API");
  }

  const data = await response.json();
  return data.text;
}
