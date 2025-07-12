// Сервис для работы с OpenAI API
class OpenAIService {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.openai.com/v1';
  }

  // Установка API ключа
  async setApiKey(apiKey) {
    this.apiKey = apiKey;
    // Сохраняем ключ в chrome.storage
    await chrome.storage.local.set({ openaiApiKey: apiKey });
  }

  // Получение API ключа из хранилища
  async getApiKey() {
    if (this.apiKey) return this.apiKey;
    
    const result = await chrome.storage.local.get(['openaiApiKey']);
    this.apiKey = result.openaiApiKey;
    return this.apiKey;
  }

  // Генерация резюме чата
  async generateChatSummary(messages) {
    const apiKey = await this.getApiKey();
    
    if (!apiKey) {
      throw new Error('OpenAI API ключ не настроен. Пожалуйста, добавьте ключ в настройках расширения.');
    }

    if (!messages || messages.length === 0) {
      throw new Error('Нет сообщений для анализа');
    }

    const prompt = `Создай краткое резюме этого чата в Telegram на русском языке. 
    Выдели основные темы, ключевые моменты и действия. Будь максимально кратким и по делу.
    Если чат пустой или содержит мало информации, укажи это.
    
    Сообщения чата:
    ${messages.map((msg, index) => `${index + 1}. ${msg.sender}: ${msg.text}`).join('\n')}`;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Ты помощник для анализа чатов. Создавай краткие и информативные резюме на русском языке.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API ошибка: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Ошибка при генерации резюме:', error);
      throw error;
    }
  }

  // Проверка валидности API ключа
  async validateApiKey(apiKey) {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const openAIService = new OpenAIService(); 