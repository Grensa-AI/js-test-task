import {
  API_CONFIG,
  MODEL_CONFIG,
  VALIDATION_CONFIG,
  PROMPTS,
  ERROR_MESSAGES,
} from "../config/constants";

export const isConfigured = () => {
  return (
    API_CONFIG.OPENAI_API_KEY && API_CONFIG.OPENAI_API_KEY.trim().length > 0
  );
};

const validateMessages = (messages) => {
  if (!messages) {
    throw new Error(ERROR_MESSAGES.NO_MESSAGES);
  }

  let text = "";
  if (typeof messages === "string") {
    text = messages.trim();
  } else if (Array.isArray(messages)) {
    text = messages
      .filter((msg) => msg && msg.trim().length > 0)
      .slice(-VALIDATION_CONFIG.MAX_MESSAGES) // Последние 20 сообщений для экономии токенов
      .join("\n");
  } else {
    text = String(messages).trim();
  }

  if (text.length < VALIDATION_CONFIG.MIN_TEXT_LENGTH) {
    throw new Error(ERROR_MESSAGES.TEXT_TOO_SHORT);
  }

  return text;
};

export const generateSummary = (messages) => {
  const validMessages = validateMessages(messages);

  if (!isConfigured()) {
    return Promise.reject(new Error(ERROR_MESSAGES.NO_API_KEY));
  }

  return fetch(`${API_CONFIG.OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      ...MODEL_CONFIG,
      messages: [
        {
          role: "system",
          content: PROMPTS.SYSTEM,
        },
        {
          role: "user",
          content: `Сообщения чата:\n\n${validMessages}`,
        },
      ],
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка API (${response.status})`);
      }

      return response.json();
    })
    .then((data) => {
      if (!data.choices || data.choices.length === 0) {
        throw new Error(ERROR_MESSAGES.NO_RESULT);
      }
      return data.choices[0].message.content.trim();
    })
    .catch((error) => {
      if (error.message.includes("401")) {
        throw new Error(ERROR_MESSAGES.INVALID_API_KEY);
      }
      if (error.message.includes("429")) {
        throw new Error(ERROR_MESSAGES.RATE_LIMIT);
      }
      if (error.message.includes("quota")) {
        throw new Error(ERROR_MESSAGES.QUOTA_EXCEEDED);
      }

      throw error;
    });
};
