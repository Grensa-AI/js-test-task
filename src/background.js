// Фоновый скрипт для работы с OpenAI API
// Этот файл отвечает за всю логику работы с API провайдерами (OpenAI, OpenRouter, Gemini)
// и управляет настройками расширения

class OpenAIService {
    constructor() {
      this.apiKey = null;
      this.apiKeys = {}; // { provider: apiKey }
      this.provider = 'openai';
      this.model = 'gpt-3.5-turbo';
      this.baseUrl = 'https://api.openai.com/v1/chat/completions';
      this.init();
    }
  
    init() {
      console.log('Grensa.AI: Background script запущен');
      // Загружаем сохраненные API ключи из сессионного хранилища
      chrome.storage.session.get(['apiKeys'], (session) => {
        this.apiKeys = session.apiKeys || {};
      });
      // Слушаем изменения в хранилище ключей
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'session' && changes.apiKeys) {
          this.apiKeys = changes.apiKeys.newValue || {};
        }
      });
      // Основной обработчик сообщений от content script и popup
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getProviderSettings') {
          chrome.storage.local.get(['models', 'activeProvider'], (local) => {
            const provider = local.activeProvider;
            const model = local.models && provider ? local.models[provider] : '';
            chrome.storage.session.get(['apiKeys'], (res) => {
              const apiKey = res.apiKeys && provider ? res.apiKeys[provider] : '';
              sendResponse({ provider, model, apiKey });
            });
          });
          return true;
        }
        if (request.action === 'getChatSummary') {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { action: 'getChatSummary' }, sendResponse);
            } else {
              sendResponse({ error: 'Не удалось найти активную вкладку Telegram Web' });
            }
          });
          return true;
        }
        if (request.action === 'chatChanged') {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { action: 'chatChanged', chatId: request.chatId });
            }
          });
          return;
        }
        if (request.action === 'openOptionsPage') {
          chrome.runtime.openOptionsPage();
          return;
        }
        this.handleMessage(request, sender, sendResponse);
        return true;
      });
      this.loadApiKey();
    }
  
    async loadApiKey() {
      try {
        const result = await chrome.storage.sync.get(['provider', 'model']);
        this.provider = result.provider || 'openai';
        this.model = result.model || 'gpt-3.5-turbo';
        this.updateBaseUrl();
      } catch (error) {
        console.error('Grensa.AI: Ошибка загрузки настроек:', error);
      }
    }
  
    updateBaseUrl() {
      if (this.provider === 'openai') {
        this.baseUrl = 'https://api.openai.com/v1/chat/completions';
      } else if (this.provider === 'openrouter') {
        this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
      } else if (this.provider === 'gemini') {
        this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
      }
    }
  
    async handleMessage(request, sender, sendResponse) {
      switch (request.action) {
        case 'generateSummary':
          if (request.provider) this.provider = request.provider;
          if (request.model) this.model = request.model;
          if (request.apiKey) this.apiKey = request.apiKey;
          this.updateBaseUrl();
          const summary = await this.generateSummary(request.messages, request.chatId);
          sendResponse(summary);
          break;
        case 'saveApiKey':
          if (request.apiKey && request.provider) {
            this.apiKey = request.apiKey;
            this.apiKeys[request.provider] = request.apiKey;
            chrome.storage.session.set({ apiKeys: this.apiKeys }, async () => {
              await this.saveProviderModel(request.provider, request.model);
              sendResponse({ success: true });
            });
            return true;
          }
          break;
        case 'testApiKey':
          if (request.provider) this.provider = request.provider;
          if (request.model) this.model = request.model;
          if (request.apiKey) this.apiKey = request.apiKey;
          this.updateBaseUrl();
          const isValid = await this.testApiKey(this.apiKey, this.provider, this.model);
          sendResponse(isValid);
          break;
        case 'hasApiKey':
          sendResponse({ hasApiKey: !!this.apiKey });
          break;
        default:
          sendResponse({ error: 'Неизвестное действие' });
      }
    }
  
    async saveProviderModel(provider, model) {
      try {
        await chrome.storage.sync.set({ provider, model });
        this.provider = provider || 'openai';
        this.model = model || 'gpt-3.5-turbo';
        this.updateBaseUrl();
        console.log('Grensa.AI: Настройки провайдера и модели сохранены');
      } catch (error) {
        console.error('Grensa.AI: Ошибка сохранения настроек:', error);
        throw error;
      }
    }
  
    async testApiKey(apiKey = this.apiKey, provider = this.provider, model = this.model) {
      if (!apiKey) return { valid: false, details: 'API ключ не передан' };
      this.updateBaseUrl();
      try {
        let response;
        if (provider === 'openai' || provider === 'openrouter') {
          response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://yourdomain.com' } : {})
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'user', content: 'Test message' }
              ],
              max_tokens: 5
            })
          });
        } else if (provider === 'gemini') {
          response = await fetch(this.baseUrl + `?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Test message' }] }]
            })
          });
        }
        if (response.ok) {
          return { valid: true };
        } else {
          let details = '';
          try {
            const data = await response.json();
            if (data && typeof data === 'object') {
              if (data.error && data.error.message) {
                details = `${response.status} ${data.error.message}`;
              } else if (data.message) {
                details = `${response.status} ${data.message}`;
              } else {
                details = `${response.status} ${JSON.stringify(data)}`;
              }
            } else {
              details = `${response.status} ${response.statusText}`;
            }
          } catch (e) {
            details = `${response.status} ${response.statusText}`;
          }
          return { valid: false, details };
        }
      } catch (error) {
        console.error('Grensa.AI: Ошибка тестирования API ключа:', error);
        return { valid: false, details: error.message };
      }
    }

    // Основной метод для генерации резюме чата
    // Принимает массив сообщений и ID чата, возвращает структурированное резюме
    async generateSummary(messages, chatId) {
      if (!this.apiKey) {
        return { 
          error: 'API ключ не настроен. Перейдите в настройки расширения.',
          needsApiKey: true 
        };
      }
  
      if (!messages || messages.length === 0) {
        return { error: 'Нет сообщений для анализа' };
      }
  
      this.updateBaseUrl();
  
      try {
        let response, summary = '';
        const formattedChat = this.formatMessagesForAI(messages);
        const promptText = this.createSummaryPrompt(formattedChat);
        
        // Отправляем запрос к выбранному провайдеру (OpenAI/OpenRouter или Gemini)
        if (this.provider === 'openai' || this.provider === 'openrouter') {
          response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              ...(this.provider === 'openrouter' ? { 'HTTP-Referer': 'https://yourdomain.com' } : {})
            },
            body: JSON.stringify({
              model: this.model,
              messages: [
                {
                  role: 'system',
                  content: 'Ты - помощник, который создает краткие и информативные резюме чатов в Telegram. Отвечай на русском языке.'
                },
                {
                  role: 'user',
                  content: promptText
                }
              ],
              max_tokens: 500,
              temperature: 0.7
            })
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API ошибка: ${response.status} - ${errorData.error?.message || 'Неизвестная ошибка'}`);
          }
          const data = await response.json();
          summary = data.choices?.[0]?.message?.content?.trim() || '';
        } else if (this.provider === 'gemini') {
          response = await fetch(this.baseUrl + `?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }]
            })
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API ошибка: ${response.status} - ${errorData.error?.message || 'Неизвестная ошибка'}`);
          }
          const data = await response.json();
          summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }
        if (!summary) {
          throw new Error('Пустой ответ от LLM');
        }
        // Сохраняем резюме в историю для последующего просмотра
        await this.saveSummaryToHistory(chatId, summary, messages.length);
        return {
          success: true,
          summary: summary,
          chatId: chatId,
          messageCount: messages.length,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('Grensa.AI: Ошибка генерации резюме:', error);
        
        let errorMessage = 'Ошибка при генерации резюме';
        
        if (error.message.includes('401')) {
          errorMessage = 'Неверный API ключ или настройки';
        } else if (error.message.includes('429')) {
          errorMessage = 'Превышен лимит запросов';
        } else if (error.message.includes('quota')) {
          errorMessage = 'Исчерпана квота';
        }
  
        return {
          error: errorMessage,
          details: error.message
        };
      }
    }
  
    // Преобразуем сообщения в формат, понятный для AI
    // Каждое сообщение становится строкой "Отправитель: текст"
    formatMessagesForAI(messages) {
      return messages.map(msg => {
        const direction = msg.isOutgoing ? 'Я' : msg.sender;
        return `${direction}: ${msg.text}`;
      }).join('\n');
    }
  
    // Создаем промпт для AI с инструкциями по структурированию резюме
    // Промпт просит выделить основные темы разговора и дать ключевые слова для поиска
    createSummaryPrompt(formattedChat) {
      return `The text document below is a message history from a Telegram group chat.
I need you to summarize this chat history and yield 5 primary conversation topics.
Each conversation topic mentioned should be accompanied by a one-sentence summaries of 2-3 most representative dialogs (not single messages) from the conversation on the given topic including user names. For each dialog summary provide the exact keywords with which the message can be found in the history using text search.
IMPORTANT: The output should be provided in the language which prevails in the messages text.

Here's an example of desired output in Russian language (follow the exact structure):

**1. Планирование встречи**
- Диалог Анны и Петра о выборе ресторана для корпоратива: обсуждали "Белые ночи" и "Максимилианс" (ключевые слова: ресторан, корпоратив, Белые ночи)
- Обсуждение Марии и Игоря о времени встречи: договорились на 19:00 в пятницу (ключевые слова: 19:00, пятница, встреча)

**2. Рабочие вопросы**
- Диалог о дедлайне проекта между Сергеем и командой: перенос сдачи на понедельник (ключевые слова: дедлайн, проект, понедельник)

---

Чат:
${formattedChat}`;
    }
  
    // Сохраняем сгенерированное резюме в локальное хранилище
    // Это позволяет пользователю просматривать историю резюме позже
    async saveSummaryToHistory(chatId, summary, messageCount) {
      try {
        const result = await chrome.storage.local.get(['summaryHistory']);
        const history = result.summaryHistory || [];
  
        const summaryEntry = {
          id: Date.now().toString(),
          chatId: chatId,
          summary: summary,
          messageCount: messageCount,
          timestamp: Date.now(),
          date: new Date().toLocaleString('ru-RU')
        };
  
        history.unshift(summaryEntry);
  
        // Ограничиваем историю до 100 записей
        const limitedHistory = history.slice(0, 100);
  
        await chrome.storage.local.set({ summaryHistory: limitedHistory });
        
        console.log('Grensa.AI: Резюме сохранено в историю');
      } catch (error) {
        console.error('Grensa.AI: Ошибка сохранения в историю:', error);
      }
    }
}

const openAIService = new OpenAIService();
