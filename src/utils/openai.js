import OpenAI from 'openai';

// Provider configurations
const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4.1-nano',
    keyPrefix: 'sk-',
    helpUrl: 'https://platform.openai.com/api-keys'
  },
  openrouter: {
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4.1-nano',
    keyPrefix: 'sk-or-',
    helpUrl: 'https://openrouter.ai/keys'
  }
};

export const generateChatSummary = async (chatData, settings = {}) => {
  try {
    if (!chatData || !chatData.messages || chatData.messages.length === 0) {
      throw new Error('No chat data provided');
    }

    // Get provider configuration
    const provider = settings.provider || 'openai';
    const providerConfig = PROVIDERS[provider];
    
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    // Format messages for OpenAI
    const formattedMessages = chatData.messages.map(msg => {
      const sender = msg.direction === 'incoming' ? 'Собеседник' : 'Я';
      return `${sender}: ${msg.text || ''}`;
    }).join('\n');

    const prompt = `Please provide a concise summary of the following chat conversation. 
    Focus on the main topics discussed, key decisions made, and important information shared.
    Keep the summary brief but comprehensive.

    Chat: ${chatData.chatTitle}
    Messages:
    ${formattedMessages}

    Please provide the summary in Russian (Резюме):`;

    // Use provider-specific model or fallback to configured model
    const model = settings.model || providerConfig.defaultModel;

    const apiPayload = {
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise summaries of chat conversations. Always respond in Russian.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    // Debug mode: return debug info without making API call
    if (settings.debugMode) {
      return {
        success: true,
        debug: true,
        debugInfo: {
          provider: providerConfig.name,
          apiKey: settings.apiKey ? `${settings.apiKey.substring(0, 7)}...` : 'Не установлен',
          model: model,
          baseURL: providerConfig.baseURL,
          messagesCount: chatData.messages.length,
          chatTitle: chatData.chatTitle,
          prompt: prompt,
          apiPayload: apiPayload,
          formattedMessages: formattedMessages
        },
        summary: `[РЕЖИМ ОТЛАДКИ] Запрос готов к отправке в ${providerConfig.name} API.\n\nПровайдер: ${providerConfig.name}\nМодель: ${model}\nЧат: ${chatData.chatTitle}\nСообщений: ${chatData.messages.length}\n\nДля получения реального резюме отключите режим отладки и убедитесь, что API ключ настроен правильно.`,
        messagesCount: chatData.messages.length,
        chatTitle: chatData.chatTitle
      };
    }

    // Check if API key is available
    if (!settings.apiKey || settings.apiKey.trim() === '') {
      throw new Error('API key not provided');
    }

    // Initialize OpenAI client with provider-specific configuration
    const clientConfig = {
      apiKey: settings.apiKey,
      dangerouslyAllowBrowser: true
    };

    // Set base URL for non-OpenAI providers
    if (provider !== 'openai') {
      clientConfig.baseURL = providerConfig.baseURL;
    }

    const openai = new OpenAI(clientConfig);

    const response = await openai.chat.completions.create(apiPayload);

    const summary = response.choices[0]?.message?.content?.trim();
    
    if (!summary) {
      throw new Error('No summary generated');
    }

    return {
      success: true,
      debug: false,
      summary: summary,
      messagesCount: chatData.messages.length,
      chatTitle: chatData.chatTitle,
      provider: providerConfig.name,
      model: model
    };

  } catch (error) {
    console.error('API Error:', error);
    
    const provider = settings.provider || 'openai';
    const providerConfig = PROVIDERS[provider];
    
    let errorMessage = 'Произошла ошибка при генерации резюме';
    
    if (error.message.includes('API key not provided')) {
      errorMessage = `Не настроен API ключ ${providerConfig.name}. Откройте настройки и добавьте ключ.`;
    } else if (error.message.includes('Incorrect API key') || error.message.includes('invalid_api_key')) {
      errorMessage = `Неверный API ключ ${providerConfig.name}. Проверьте ключ в настройках.`;
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Превышен лимит запросов API. Попробуйте позже.';
    } else if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
      errorMessage = `Превышена квота API. Проверьте баланс на ${providerConfig.helpUrl}.`;
    } else if (error.message.includes('No chat data')) {
      errorMessage = 'Нет данных чата для обработки';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
    } else if (error.message.includes('Unknown provider')) {
      errorMessage = error.message;
    }

    return {
      success: false,
      debug: false,
      error: errorMessage,
      originalError: error.message,
      provider: providerConfig.name
    };
  }
};

// Export provider configurations for use in settings
export { PROVIDERS }; 