// Фоновый скрипт для работы с OpenAI API

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
      chrome.storage.session.get(['apiKeys'], (session) => {
        this.apiKeys = session.apiKeys || {};
      });
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'session' && changes.apiKeys) {
          this.apiKeys = changes.apiKeys.newValue || {};
        }
      });
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
}

const openAIService = new OpenAIService();
