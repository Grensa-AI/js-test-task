// Summary cache utility for aggressive caching with manual invalidation
// This helps reduce expensive API calls by storing summaries persistently

import { addSummaryToHistory } from './summaryHistory';

const CACHE_KEYS = {
  SUMMARIES: 'telegram_extension_summaries',
  CACHE_METADATA: 'telegram_extension_cache_metadata'
};

// Generate a hash for message content to detect changes
const generateContentHash = (messages) => {
  if (!messages || messages.length === 0) return '';
  
  // Create a simple hash based on message content and count
  const contentString = messages.map(msg => `${msg.text || ''}_${msg.direction || ''}`).join('|');
  let hash = 0;
  for (let i = 0; i < contentString.length; i++) {
    const char = contentString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

// Generate cache key for a chat
const generateCacheKey = (chatData) => {
  if (!chatData || !chatData.chatTitle) return null;
  
  const chatId = chatData.chatId || chatData.chatTitle;
  const messageCount = chatData.messages ? chatData.messages.length : 0;
  const contentHash = generateContentHash(chatData.messages);
  
  return `${chatId}_${messageCount}_${contentHash}`;
};

// Load cached summaries from storage
export const loadSummaryCache = async () => {
  try {
    // Try Chrome storage first
    if (chrome && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get([CACHE_KEYS.SUMMARIES, CACHE_KEYS.CACHE_METADATA]);
      return {
        summaries: result[CACHE_KEYS.SUMMARIES] || {},
        metadata: result[CACHE_KEYS.CACHE_METADATA] || {}
      };
    }
    
    // Fallback to localStorage
    const summaries = JSON.parse(localStorage.getItem(CACHE_KEYS.SUMMARIES) || '{}');
    const metadata = JSON.parse(localStorage.getItem(CACHE_KEYS.CACHE_METADATA) || '{}');
    
    return { summaries, metadata };
  } catch (error) {
    console.error('Error loading summary cache:', error);
    return { summaries: {}, metadata: {} };
  }
};

// Save cached summaries to storage
export const saveSummaryCache = async (summaries, metadata) => {
  try {
    // Try Chrome storage first
    if (chrome && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        [CACHE_KEYS.SUMMARIES]: summaries,
        [CACHE_KEYS.CACHE_METADATA]: metadata
      });
    } else {
      // Fallback to localStorage
      localStorage.setItem(CACHE_KEYS.SUMMARIES, JSON.stringify(summaries));
      localStorage.setItem(CACHE_KEYS.CACHE_METADATA, JSON.stringify(metadata));
    }
    
    console.log('Summary cache saved successfully');
  } catch (error) {
    console.error('Error saving summary cache:', error);
    throw error;
  }
};

// Get cached summary for chat data
export const getCachedSummary = async (chatData, settings) => {
  try {
    const cacheKey = generateCacheKey(chatData);
    if (!cacheKey) return null;
    
    const { summaries, metadata } = await loadSummaryCache();
    
    // Check if we have a cached summary for this exact chat state
    const cachedSummary = summaries[cacheKey];
    if (!cachedSummary) return null;
    
    // Check if the cached summary matches current settings (provider, model, etc.)
    const cachedMetadata = metadata[cacheKey];
    if (cachedMetadata) {
      const currentProvider = settings?.provider || 'openai';
      const currentModel = settings?.model || 'gpt-4.1-nano';
      
      // If provider or model changed, invalidate cache
      if (cachedMetadata.provider !== currentProvider || cachedMetadata.model !== currentModel) {
        console.log('Cache invalidated due to provider/model change');
        return null;
      }
    }
    
    // Add cache metadata to the summary
    const summaryWithCache = {
      ...cachedSummary,
      cached: true,
      cacheKey: cacheKey,
      cachedAt: cachedMetadata?.cachedAt,
      cacheHit: true
    };
    
    console.log('Cache hit for chat:', chatData.chatTitle, 'Key:', cacheKey);
    return summaryWithCache;
  } catch (error) {
    console.error('Error getting cached summary:', error);
    return null;
  }
};

// Cache a summary for chat data
export const cacheSummary = async (chatData, settings, summaryResult) => {
  try {
    const cacheKey = generateCacheKey(chatData);
    if (!cacheKey) return;
    
    const { summaries, metadata } = await loadSummaryCache();
    
    // Store the summary
    summaries[cacheKey] = {
      ...summaryResult,
      cached: false // Mark as fresh when initially cached
    };
    
    // Store metadata
    metadata[cacheKey] = {
      chatTitle: chatData.chatTitle,
      chatId: chatData.chatId || chatData.chatTitle,
      messageCount: chatData.messages ? chatData.messages.length : 0,
      cachedAt: new Date().toISOString(),
      provider: settings?.provider || 'openai',
      model: settings?.model || 'gpt-4.1-nano',
      contentHash: generateContentHash(chatData.messages)
    };
    
    // Clean up old cache entries (keep only last 50 entries)
    const cacheEntries = Object.entries(metadata);
    if (cacheEntries.length > 50) {
      // Sort by cachedAt and keep only the most recent 50
      const sortedEntries = cacheEntries.sort((a, b) => 
        new Date(b[1].cachedAt) - new Date(a[1].cachedAt)
      );
      
      const keysToKeep = sortedEntries.slice(0, 50).map(([key]) => key);
      const keysToRemove = sortedEntries.slice(50).map(([key]) => key);
      
      // Remove old entries
      keysToRemove.forEach(key => {
        delete summaries[key];
        delete metadata[key];
      });
      
      console.log(`Cleaned up ${keysToRemove.length} old cache entries`);
    }
    
    await saveSummaryCache(summaries, metadata);
    console.log('Summary cached successfully for chat:', chatData.chatTitle, 'Key:', cacheKey);
    
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

// Clear all cached summaries
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
    const cacheKey = generateCacheKey(chatData);
    if (!cacheKey) return;
    
    const { summaries, metadata } = await loadSummaryCache();
    
    delete summaries[cacheKey];
    delete metadata[cacheKey];
    
    await saveSummaryCache(summaries, metadata);
    console.log('Cache cleared for chat:', chatData.chatTitle, 'Key:', cacheKey);
  } catch (error) {
    console.error('Error clearing chat cache:', error);
    throw error;
  }
};

// Get cache statistics
export const getCacheStats = async () => {
  try {
    const { summaries, metadata } = await loadSummaryCache();
    
    const totalEntries = Object.keys(summaries).length;
    const totalSize = JSON.stringify(summaries).length + JSON.stringify(metadata).length;
    
    // Get cache entries by recency
    const entries = Object.entries(metadata).map(([key, meta]) => ({
      key,
      chatTitle: meta.chatTitle,
      messageCount: meta.messageCount,
      cachedAt: meta.cachedAt,
      provider: meta.provider,
      model: meta.model
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

// Check if chat content has changed since last cache
export const hasChatChanged = async (chatData) => {
  try {
    const cacheKey = generateCacheKey(chatData);
    if (!cacheKey) return true;
    
    const { metadata } = await loadSummaryCache();
    const cachedMetadata = metadata[cacheKey];
    
    if (!cachedMetadata) return true;
    
    // Compare message count and content hash
    const currentMessageCount = chatData.messages ? chatData.messages.length : 0;
    const currentContentHash = generateContentHash(chatData.messages);
    
    return (
      cachedMetadata.messageCount !== currentMessageCount ||
      cachedMetadata.contentHash !== currentContentHash
    );
  } catch (error) {
    console.error('Error checking if chat changed:', error);
    return true;
  }
}; 