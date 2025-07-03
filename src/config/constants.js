export const API_CONFIG = {
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY,
};

export const MODEL_CONFIG = {
  model: process.env.REACT_APP_OPENAI_MODEL || "gpt-3.5-turbo",
  max_tokens: 500,
  temperature: 0.3,
};

export const VALIDATION_CONFIG = {
  MIN_TEXT_LENGTH: 10,
  MAX_MESSAGES: 20,
};

export const PROMPTS = {
  SYSTEM: `Создай детальное резюме чата Telegram на русском языке.

    ЧТО ИЗВЛЕЧЬ:
    • Конкретные факты: цифры, даты, имена, места
    • Договоренности: кто, что, когда делает
    • Проблемы: что не работает, что нужно исправить
    • Планы: предстоящие события, встречи, покупки
    • Важная информация: контакты, ссылки, инструкции

    ТРЕБОВАНИЯ:
    - Без заголовков
    - Максимум конкретики, минимум общих фраз
    - Структурированная подача по категориям
    - 5-7 коротких, информативных предложений
    - БЕЗ итоговых выводов и заключений

    ИЗБЕГАЙ общих фраз типа "участники обсуждали", "в чате говорилось".`,
};

export const ERROR_MESSAGES = {
  NO_API_KEY: "OpenAI API ключ не настроен в .env файле",
  NO_MESSAGES: "Нет сообщений для анализа. Откройте чат в Telegram.",
  TEXT_TOO_SHORT:
    "Слишком мало текста для анализа. Выберите более активный чат.",
  NO_RESULT: "OpenAI не вернул результат",
  INVALID_API_KEY: "Неверный API ключ OpenAI",
  RATE_LIMIT: "Превышен лимит запросов. Попробуйте позже.",
  QUOTA_EXCEEDED: "Исчерпан баланс OpenAI API",
};

export const STORAGE_KEY = "telegram-extension-position";
export const CONTAINER_WIDTH = 400;
export const CONTAINER_MIN_HEIGHT = 200;
