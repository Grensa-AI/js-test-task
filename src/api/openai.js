export async function getSummary(messages, apiKey) {
  console.log("Сообщения (заглушка):", messages);
  await new Promise((res) => setTimeout(res, 500)); // имитируем задержку

  return "Это пример сгенерированного резюме. Здесь будет краткий пересказ переписки.";
}

/* export async function getSummary(messages, apiKey) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: [{
          role: "system",
          content: "Ты — ассистент, который делает краткое и понятное резюме из переписки в Телеграм.",
        },
        {
          role: "user",
          content: messages.join("\n"),
        }
        ],
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Ошибка запроса");
    }
    console.log("✅ Ответ от GPT:", data);
    return data.choices?.[0]?.message?.content || "Пустой ответ";
  }
  catch(error) {
    console.error("❌ Ошибка при получении резюме:", error.message);
    return null;
  }
} */