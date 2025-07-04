export const SUMMARY_STATUS = {
  INITIAL: "initial",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

export const SUMMARY_MESSAGES = {
  DEFAULT: "Прокрутите до нужного места в чате и нажмите «Сгенерировать резюме»."
};

export const SUMMARY_BUTTON_TEXT = {
  initial: "Сгенерировать резюме",
  loading: "⏳ Генерация...",
  success: "Перегенерировать резюме",
  error: "Попробовать снова",
};

export const ERROR_MESSAGES = {
  NO_MESSAGES: "Сообщения не найдены.",
  NETWORK_ERROR: "Нет подключения к сети.",
  RATE_LIMIT: "Вы превысили лимит запросов. Попробуйте позже.",
  API_KEY_MISSING: "API ключ не найден. Проверьте настройки.",
  DEFAULT: "Произошла ошибка при генерации резюме.",
};