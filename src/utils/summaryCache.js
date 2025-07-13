

import { addSummaryToHistory } from './summaryHistory';

const CACHE_KEYS = {
  CHAT_SUMMARIES: 'telegram_extension_chat_summaries',
  CHAT_CONTEXTS: 'telegram_extension_chat_contexts'
};


const generateChatId = (chatData) => {
  if (!chatData) return null;
  return chatData.chatId || chatData.chatTitle || null;
};


export const loadSummaryCache = async () => {
  try {
    // Try Chrome storage first
    if (chrome && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get([CACHE_KEYS.CHAT_SUMMARIES, CACHE_KEYS.CHAT_CONTEXTS]);
      return {
        summaries: result[CACHE_KEYS.CHAT_SUMMARIES] || {},
        contexts: result[CACHE_KEYS.CHAT_CONTEXTS] || {}
      };
    }
    
    // Fallback to localStorage
    const summaries = JSON.parse(localStorage.getItem(CACHE_KEYS.CHAT_SUMMARIES) || '{}');
    const contexts = JSON.parse(localStorage.getItem(CACHE_KEYS.CHAT_CONTEXTS) || '{}');
    
    return { summaries, contexts };
  } catch (error) {
    return { summaries: {}, contexts: {} };
  }
};


export const saveSummaryCache = async (summaries, contexts) => {
  try {
    // Try Chrome storage first
    if (chrome && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        [CACHE_KEYS.CHAT_SUMMARIES]: summaries,
        [CACHE_KEYS.CHAT_CONTEXTS]: contexts
      });
      return;
    }
    
    // Fallback to localStorage
    localStorage.setItem(CACHE_KEYS.CHAT_SUMMARIES, JSON.stringify(summaries));
    localStorage.setItem(CACHE_KEYS.CHAT_CONTEXTS, JSON.stringify(contexts));
    

  } catch (error) {
    throw error;
  }
};


export const getCachedSummary = async (chatData, settings) => {
  try {
    const chatId = generateChatId(chatData);
    if (!chatId) return null;
    
    const { summaries, contexts } = await loadSummaryCache();
    
    const cachedSummary = summaries[chatId];
    if (!cachedSummary) return null;
    

    if (cachedSummary.provider !== (settings?.provider || 'openai') ||
        cachedSummary.model !== (settings?.model || 'gpt-4.1-nano')) {

      return null;
    }
    

    const context = contexts[chatId];
    
    const summaryWithCache = {
      ...cachedSummary,
      cached: true,
      context: context || null
    };
    

    return summaryWithCache;
  } catch (error) {
    return null;
  }
};


export const cacheSummary = async (chatData, settings, summaryResult, contextInfo = null) => {
  try {
    const chatId = generateChatId(chatData);
    if (!chatId) return;
    
    const { summaries, contexts } = await loadSummaryCache();
    

    summaries[chatId] = {
      ...summaryResult,
      chatId: chatId,
      chatTitle: chatData.chatTitle,
      cachedAt: new Date().toISOString(),
      provider: settings?.provider || 'openai',
      model: settings?.model || 'gpt-4.1-nano',
      cached: false
    };
    

    if (contextInfo) {
      contexts[chatId] = {
        ...contextInfo,
        chatId: chatId,
        chatTitle: chatData.chatTitle,
        updatedAt: new Date().toISOString()
      };
    }
    

    const chatIds = Object.keys(summaries);
    if (chatIds.length > 100) {

      const sortedEntries = chatIds.map(id => ({
        id,
        cachedAt: summaries[id].cachedAt
      })).sort((a, b) => new Date(b.cachedAt) - new Date(a.cachedAt));
      
      const idsToKeep = sortedEntries.slice(0, 100).map(entry => entry.id);
      const idsToRemove = sortedEntries.slice(100).map(entry => entry.id);
      

      idsToRemove.forEach(id => {
        delete summaries[id];
        delete contexts[id];
      });
      

    }
    
    await saveSummaryCache(summaries, contexts);

    

    if (!summaryResult.cached) {
      try {
        await addSummaryToHistory(chatData, settings, summaryResult);
      } catch (historyError) {

      }
    }
  } catch (error) {
  }
};


export const clearAllSummaryCache = async () => {
  try {
    await saveSummaryCache({}, {});

  } catch (error) {
    throw error;
  }
};


export const clearChatSummaryCache = async (chatData) => {
  try {
    const chatId = generateChatId(chatData);
    if (!chatId) return;
    
    const { summaries, contexts } = await loadSummaryCache();
    
    delete summaries[chatId];
    delete contexts[chatId];
    
    await saveSummaryCache(summaries, contexts);

  } catch (error) {
    throw error;
  }
};


export const getCacheStats = async () => {
  try {
    const { summaries, contexts } = await loadSummaryCache();
    
    const totalEntries = Object.keys(summaries).length;
    const totalSize = JSON.stringify(summaries).length + JSON.stringify(contexts).length;
    

    const entries = Object.entries(summaries).map(([chatId, summary]) => ({
      chatId,
      chatTitle: summary.chatTitle,
      cachedAt: summary.cachedAt,
      provider: summary.provider,
      model: summary.model,
      hasContext: !!contexts[chatId]
    })).sort((a, b) => new Date(b.cachedAt) - new Date(a.cachedAt));
    
    return {
      totalEntries,
      totalSize,
      entries
    };
  } catch (error) {
    return {
      totalEntries: 0,
      totalSize: 0,
      entries: []
    };
  }
}; 