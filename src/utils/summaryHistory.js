

const HISTORY_KEYS = {
  SUMMARY_HISTORY: 'telegram_extension_summary_history',
  HISTORY_METADATA: 'telegram_extension_history_metadata'
};


const MAX_HISTORY_ENTRIES = 100;


const generateHistoryId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};


export const loadSummaryHistory = async () => {
  try {
    // Try Chrome storage first
    if (chrome && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get([HISTORY_KEYS.SUMMARY_HISTORY, HISTORY_KEYS.HISTORY_METADATA]);
      return {
        history: result[HISTORY_KEYS.SUMMARY_HISTORY] || [],
        metadata: result[HISTORY_KEYS.HISTORY_METADATA] || {}
      };
    }
    
    // Fallback to localStorage
    const history = JSON.parse(localStorage.getItem(HISTORY_KEYS.SUMMARY_HISTORY) || '[]');
    const metadata = JSON.parse(localStorage.getItem(HISTORY_KEYS.HISTORY_METADATA) || '{}');
    
    return { history, metadata };
  } catch (error) {
    return { history: [], metadata: {} };
  }
};


export const saveSummaryHistory = async (history, metadata) => {
  try {
    // Try Chrome storage first
    if (chrome && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        [HISTORY_KEYS.SUMMARY_HISTORY]: history,
        [HISTORY_KEYS.HISTORY_METADATA]: metadata
      });
    } else {
      // Fallback to localStorage
      localStorage.setItem(HISTORY_KEYS.SUMMARY_HISTORY, JSON.stringify(history));
      localStorage.setItem(HISTORY_KEYS.HISTORY_METADATA, JSON.stringify(metadata));
    }
    

  } catch (error) {
    throw error;
  }
};


export const addSummaryToHistory = async (chatData, settings, summaryResult) => {
  try {
    const { history, metadata } = await loadSummaryHistory();
    
    const historyId = generateHistoryId();
    const timestamp = new Date().toISOString();
    

    const contextData = {
      chatTitle: chatData.chatTitle,
      chatId: chatData.chatId || chatData.chatTitle,
      messageCount: chatData.messages ? chatData.messages.length : 0,
      messagesPreview: chatData.messages ? 
        chatData.messages.slice(-5).map(msg => ({
          text: msg.text ? msg.text.substring(0, 100) : '',
          direction: msg.direction,
          timestamp: msg.timestamp
        })) : [],
      settings: {
        provider: settings?.provider || 'openai',
        model: settings?.model || 'gpt-4.1-nano',
        debugMode: settings?.debugMode || false
      },
      contentHash: generateContentHash(chatData.messages)
    };
    

    const historyEntry = {
      id: historyId,
      timestamp: timestamp,
      chatTitle: chatData.chatTitle,
      chatId: chatData.chatId || chatData.chatTitle,
      summary: summaryResult.summary,
      context: contextData,
      provider: summaryResult.provider,
      model: summaryResult.model || settings?.model,
      debug: summaryResult.debug || false,
      cached: summaryResult.cached || false
    };
    

    history.unshift(historyEntry);
    

    metadata[historyId] = {
      chatTitle: chatData.chatTitle,
      chatId: chatData.chatId || chatData.chatTitle,
      createdAt: timestamp,
      messageCount: contextData.messageCount,
      provider: contextData.settings.provider,
      model: contextData.settings.model
    };
    

    if (history.length > MAX_HISTORY_ENTRIES) {
      const entriesToRemove = history.splice(MAX_HISTORY_ENTRIES);
      entriesToRemove.forEach(entry => {
        delete metadata[entry.id];
      });

    }
    
    await saveSummaryHistory(history, metadata);

    
    // Dispatch custom event to notify components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('summaryHistoryUpdated', {
        detail: { historyId, historyEntry }
      }));
    }
    
    return historyId;
  } catch (error) {
    throw error;
  }
};


export const getSummaryHistory = async (filters = {}) => {
  try {
    const { history } = await loadSummaryHistory();
    
    let filteredHistory = [...history];
    

    if (filters.chatId) {
      filteredHistory = filteredHistory.filter(entry => 
        entry.chatId === filters.chatId
      );
    }
    

    if (filters.provider) {
      filteredHistory = filteredHistory.filter(entry => 
        entry.provider === filters.provider
      );
    }
    

    if (filters.fromDate) {
      filteredHistory = filteredHistory.filter(entry => 
        new Date(entry.timestamp) >= new Date(filters.fromDate)
      );
    }
    
    if (filters.toDate) {
      filteredHistory = filteredHistory.filter(entry => 
        new Date(entry.timestamp) <= new Date(filters.toDate)
      );
    }
    

    if (filters.limit) {
      filteredHistory = filteredHistory.slice(0, filters.limit);
    }
    
    return filteredHistory;
  } catch (error) {
    return [];
  }
};


export const deleteHistoryEntry = async (historyId) => {
  try {
    const { history, metadata } = await loadSummaryHistory();
    
    const entryIndex = history.findIndex(entry => entry.id === historyId);
    if (entryIndex === -1) {
      return false;
    }
    

    history.splice(entryIndex, 1);
    

    delete metadata[historyId];
    
    await saveSummaryHistory(history, metadata);

    
    // Dispatch custom event to notify components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('summaryHistoryUpdated', {
        detail: { action: 'delete', historyId }
      }));
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};


export const clearAllHistory = async () => {
  try {
    await saveSummaryHistory([], {});

    
    // Dispatch custom event to notify components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('summaryHistoryUpdated', {
        detail: { action: 'clear' }
      }));
    }
  } catch (error) {
    throw error;
  }
};

// Get history statistics
export const getHistoryStats = async () => {
  try {
    const { history } = await loadSummaryHistory();
    
    const stats = {
      totalEntries: history.length,
      uniqueChats: new Set(history.map(entry => entry.chatId)).size,
      providers: {},
      models: {},
      dateRange: {
        oldest: null,
        newest: null
      }
    };
    
    history.forEach(entry => {
      // Count providers
      if (entry.provider) {
        stats.providers[entry.provider] = (stats.providers[entry.provider] || 0) + 1;
      }
      
      // Count models
      if (entry.model) {
        stats.models[entry.model] = (stats.models[entry.model] || 0) + 1;
      }
      
      // Track date range
      const entryDate = new Date(entry.timestamp);
      if (!stats.dateRange.oldest || entryDate < new Date(stats.dateRange.oldest)) {
        stats.dateRange.oldest = entry.timestamp;
      }
      if (!stats.dateRange.newest || entryDate > new Date(stats.dateRange.newest)) {
        stats.dateRange.newest = entry.timestamp;
      }
    });
    
    return stats;
  } catch (error) {
    return {
      totalEntries: 0,
      uniqueChats: 0,
      providers: {},
      models: {},
      dateRange: { oldest: null, newest: null }
    };
  }
};

// Helper function to generate content hash (copied from summaryCache.js)
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