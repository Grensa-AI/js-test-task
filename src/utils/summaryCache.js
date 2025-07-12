// Chat-based summary cache utility - one summary per chat max
// This new system allows context selection and replaces summaries when regenerated

import { addSummaryToHistory } from './summaryHistory';

const CACHE_KEYS = {
  CHAT_SUMMARIES: 'telegram_extension_chat_summaries',
  CHAT_CONTEXTS: 'telegram_extension_chat_contexts'
};

// Generate a simple chat identifier
const generateChatId = (chatData) => {
  if (!chatData) return null;
  return chatData.chatId || chatData.chatTitle || null;
};

// Load cached summaries from storage
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
    console.error('Error loading summary cache:', error);
    return { summaries: {}, contexts: {} };
  }
};

// Save cached summaries to storage
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
    
    console.log('Summary cache saved successfully');
  } catch (error) {
    console.error('Error saving summary cache:', error);
    throw error;
  }
};

// Get cached summary for a chat
export const getCachedSummary = async (chatData, settings) => {
  try {
    const chatId = generateChatId(chatData);
    if (!chatId) return null;
    
    const { summaries, contexts } = await loadSummaryCache();
    
    const cachedSummary = summaries[chatId];
    if (!cachedSummary) return null;
    
    // Check if the cached summary matches current settings (provider, model, etc.)
    if (cachedSummary.provider !== (settings?.provider || 'openai') ||
        cachedSummary.model !== (settings?.model || 'gpt-4.1-nano')) {
      console.log('Cache invalidated due to provider/model change');
      return null;
    }
    
    // Get context information
    const context = contexts[chatId];
    
    const summaryWithCache = {
      ...cachedSummary,
      cached: true,
      context: context || null
    };
    
    console.log('Cache hit for chat:', chatData.chatTitle, 'Chat ID:', chatId);
    return summaryWithCache;
  } catch (error) {
    console.error('Error getting cached summary:', error);
    return null;
  }
};

// Cache a summary for a chat (replaces any existing summary)
export const cacheSummary = async (chatData, settings, summaryResult, contextInfo = null) => {
  try {
    const chatId = generateChatId(chatData);
    if (!chatId) return;
    
    const { summaries, contexts } = await loadSummaryCache();
    
    // Store the summary (replacing any existing one)
    summaries[chatId] = {
      ...summaryResult,
      chatId: chatId,
      chatTitle: chatData.chatTitle,
      cachedAt: new Date().toISOString(),
      provider: settings?.provider || 'openai',
      model: settings?.model || 'gpt-4.1-nano',
      cached: false // Mark as fresh when initially cached
    };
    
    // Store context information if provided
    if (contextInfo) {
      contexts[chatId] = {
        ...contextInfo,
        chatId: chatId,
        chatTitle: chatData.chatTitle,
        updatedAt: new Date().toISOString()
      };
    }
    
    // Clean up old cache entries (keep only last 100 chats)
    const chatIds = Object.keys(summaries);
    if (chatIds.length > 100) {
      // Sort by cachedAt and keep only the most recent
      const sortedEntries = chatIds.map(id => ({
        id,
        cachedAt: summaries[id].cachedAt
      })).sort((a, b) => new Date(b.cachedAt) - new Date(a.cachedAt));
      
      const idsToKeep = sortedEntries.slice(0, 100).map(entry => entry.id);
      const idsToRemove = sortedEntries.slice(100).map(entry => entry.id);
      
      // Remove old entries
      idsToRemove.forEach(id => {
        delete summaries[id];
        delete contexts[id];
      });
      
      console.log(`Cleaned up ${idsToRemove.length} old cache entries`);
    }
    
    await saveSummaryCache(summaries, contexts);
    console.log('Summary cached successfully for chat:', chatData.chatTitle, 'Chat ID:', chatId);
    
    // Add to history if this is a new summary (not from cache)
    if (!summaryResult.cached) {
      try {
        await addSummaryToHistory(chatData, settings, summaryResult);
        console.log('Summary added to history');
      } catch (historyError) {
        console.error('Error adding summary to history:', historyError);
        // Don't fail the caching if history fails
      }
    }
  } catch (error) {
    console.error('Error caching summary:', error);
  }
};

// Clear all summary cache
export const clearAllSummaryCache = async () => {
  try {
    await saveSummaryCache({}, {});
    console.log('All summary cache cleared');
  } catch (error) {
    console.error('Error clearing summary cache:', error);
    throw error;
  }
};

// Clear cached summary for specific chat
export const clearChatSummaryCache = async (chatData) => {
  try {
    const chatId = generateChatId(chatData);
    if (!chatId) return;
    
    const { summaries, contexts } = await loadSummaryCache();
    
    delete summaries[chatId];
    delete contexts[chatId];
    
    await saveSummaryCache(summaries, contexts);
    console.log('Cache cleared for chat:', chatData.chatTitle, 'Chat ID:', chatId);
  } catch (error) {
    console.error('Error clearing chat cache:', error);
    throw error;
  }
};

// Get cache statistics
export const getCacheStats = async () => {
  try {
    const { summaries, contexts } = await loadSummaryCache();
    
    const totalEntries = Object.keys(summaries).length;
    const totalSize = JSON.stringify(summaries).length + JSON.stringify(contexts).length;
    
    // Get cache entries by recency
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
    console.error('Error getting cache stats:', error);
    return {
      totalEntries: 0,
      totalSize: 0,
      entries: []
    };
  }
};

// Check if chat has a cached summary
export const hasCachedSummary = async (chatData) => {
  try {
    const chatId = generateChatId(chatData);
    if (!chatId) return false;
    
    const { summaries } = await loadSummaryCache();
    return !!summaries[chatId];
  } catch (error) {
    console.error('Error checking cached summary:', error);
    return false;
  }
};

// Get context information for a chat
export const getChatContext = async (chatData) => {
  try {
    const chatId = generateChatId(chatData);
    if (!chatId) return null;
    
    const { contexts } = await loadSummaryCache();
    return contexts[chatId] || null;
  } catch (error) {
    console.error('Error getting chat context:', error);
    return null;
  }
};

// Save context information for a chat
export const saveChatContext = async (chatData, contextInfo) => {
  try {
    const chatId = generateChatId(chatData);
    if (!chatId) return;
    
    const { summaries, contexts } = await loadSummaryCache();
    
    contexts[chatId] = {
      ...contextInfo,
      chatId: chatId,
      chatTitle: chatData.chatTitle,
      updatedAt: new Date().toISOString()
    };
    
    await saveSummaryCache(summaries, contexts);
    console.log('Context saved for chat:', chatData.chatTitle, 'Chat ID:', chatId);
  } catch (error) {
    console.error('Error saving chat context:', error);
  }
}; 