export async function fetchSummaryFromOpenAI(messages) {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ OpenAI API ключ не задан");
    return "API key not found.";
  }

  const prompt = `
Вот сообщения из Telegram чата:

${messages.map((msg) => `${msg.author}: ${msg.text}`).join("\n")}

Сделай краткое резюме обсуждения на русском языке. Если ты получишь пустые сообщения, то напиши, что ничего не обсуждалось
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();

    return data.choices?.[0]?.message?.content || "Не удалось сгенерировать резюме";
  } catch (error) {
    console.error("Ошибка при запросе к OpenAI:", error);
    return "Ошибка генерации резюме.";
  }
}
