import OpenAI from 'openai';
import i18n from '../i18n';

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
      throw new Error(i18n.t('noChatData'));
    }

    // Get provider configuration
    const provider = settings.provider || 'openai';
    const providerConfig = PROVIDERS[provider];
    
    if (!providerConfig) {
      throw new Error(i18n.t('unknownProvider') + `: ${provider}`);
    }

    // Format messages for OpenAI
    const formattedMessages = chatData.messages.map(msg => {
      const sender = msg.direction === 'incoming' ? i18n.t('participant') : i18n.t('me');
      return `${sender}: ${msg.text || ''}`;
    }).join('\n');

    const prompt = `${i18n.t('promptSummaryInstruction')} 
    ${i18n.t('promptFocusInstruction')}
    ${i18n.t('promptBriefInstruction')}

    ${i18n.t('promptChatLabel')}: ${chatData.chatTitle}
    ${i18n.t('promptMessagesLabel')}:
    ${formattedMessages}

    ${i18n.t('promptResponseInstruction')}`;

    // Use provider-specific model or fallback to configured model
    const model = settings.model || providerConfig.defaultModel;

    const apiPayload = {
      model: model,
      messages: [
        {
          role: 'system',
          content: i18n.t('systemMessage')
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
          apiKey: settings.apiKey ? `${settings.apiKey.substring(0, 7)}...` : i18n.t('noApiKey'),
          model: model,
          baseURL: providerConfig.baseURL,
          messagesCount: chatData.messages.length,
          chatTitle: chatData.chatTitle,
          prompt: prompt,
          apiPayload: apiPayload,
          formattedMessages: formattedMessages
        },
        summary: `[${i18n.t('debugMode')}] ${i18n.t('debugModeRequest', { provider: providerConfig.name })}.\n\n${i18n.t('debugModeProvider')}: ${providerConfig.name}\n${i18n.t('debugModeModel')}: ${model}\n${i18n.t('debugModeChat')}: ${chatData.chatTitle}\n${i18n.t('debugModeMessagesCount')}: ${chatData.messages.length}\n\n${i18n.t('debugModeRealSummary')}.`,
        messagesCount: chatData.messages.length,
        chatTitle: chatData.chatTitle
      };
    }

    // Check if API key is available
    if (!settings.apiKey || settings.apiKey.trim() === '') {
      throw new Error(i18n.t('apiKeyNotProvided'));
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
      throw new Error(i18n.t('noSummaryGenerated'));
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
    
    let errorMessage = i18n.t('summaryError');
    
    if (error.message.includes(i18n.t('apiKeyNotProvided'))) {
      errorMessage = i18n.t('noApiKey');
    } else if (error.message.includes('Incorrect API key') || error.message.includes('invalid_api_key')) {
      errorMessage = i18n.t('summaryError');
    } else if (error.message.includes('rate limit')) {
      errorMessage = i18n.t('summaryError');
    } else if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
      errorMessage = i18n.t('summaryError');
    } else if (error.message.includes(i18n.t('noChatData'))) {
      errorMessage = i18n.t('noMessages');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = i18n.t('summaryError');
    } else if (error.message.includes(i18n.t('unknownProvider'))) {
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