export async function getSummary(messagesText, apiKey) {
	const messages = [
		{
			role: "user",
			content: `Сделай краткое резюме диалога:\n\n${messagesText}`,
		},
	];

	try {
		const res = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages,
			}),
		});

		const data = await res.json();

		if (!res.ok) {
			console.error("Ошибка OpenAI:", data);
			return `OpenAI error: ${data?.error?.message ?? "Unknown error"}`;
		}

		return data.choices?.[0]?.message?.content ?? "Ответ пуст";
	} catch (error) {
		console.error("Сетевая ошибка:", error);
		return "Не удалось получить резюме (сетевая ошибка)";
	}
}
