// Summary history utility for tracking summaries with context
// This stores a chronological history of summaries with their context data

const HISTORY_KEYS = {
  SUMMARY_HISTORY: 'telegram_extension_summary_history',
  HISTORY_METADATA: 'telegram_extension_history_metadata'
};

// Maximum number of history entries to keep
const MAX_HISTORY_ENTRIES = 100;

// Generate a unique ID for a history entry
const generateHistoryId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Load summary history from storage
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
    console.error('Error loading summary history:', error);
    return { history: [], metadata: {} };
  }
};

// Save summary history to storage
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
    
    console.log('Summary history saved successfully');
  } catch (error) {
    console.error('Error saving summary history:', error);
    throw error;
  }
};

// Add a new summary to history
export const addSummaryToHistory = async (chatData, settings, summaryResult) => {
  try {
    const { history, metadata } = await loadSummaryHistory();
    
    const historyId = generateHistoryId();
    const timestamp = new Date().toISOString();
    
    // Create context data
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
    
    // Create history entry
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
    
    // Add to history (newest first)
    history.unshift(historyEntry);
    
    // Update metadata
    metadata[historyId] = {
      chatTitle: chatData.chatTitle,
      chatId: chatData.chatId || chatData.chatTitle,
      createdAt: timestamp,
      messageCount: contextData.messageCount,
      provider: contextData.settings.provider,
      model: contextData.settings.model
    };
    
    // Clean up old entries (keep only MAX_HISTORY_ENTRIES)
    if (history.length > MAX_HISTORY_ENTRIES) {
      const entriesToRemove = history.splice(MAX_HISTORY_ENTRIES);
      entriesToRemove.forEach(entry => {
        delete metadata[entry.id];
      });
      console.log(`Cleaned up ${entriesToRemove.length} old history entries`);
    }
    
    await saveSummaryHistory(history, metadata);
    console.log('Summary added to history:', historyId);
    
    return historyId;
  } catch (error) {
    console.error('Error adding summary to history:', error);
    throw error;
  }
};

// Get summary history with optional filters
export const getSummaryHistory = async (filters = {}) => {
  try {
    const { history } = await loadSummaryHistory();
    
    let filteredHistory = [...history];
    
    // Filter by chat
    if (filters.chatId) {
      filteredHistory = filteredHistory.filter(entry => 
        entry.chatId === filters.chatId
      );
    }
    
    // Filter by provider
    if (filters.provider) {
      filteredHistory = filteredHistory.filter(entry => 
        entry.provider === filters.provider
      );
    }
    
    // Filter by date range
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
    
    // Limit results
    if (filters.limit) {
      filteredHistory = filteredHistory.slice(0, filters.limit);
    }
    
    return filteredHistory;
  } catch (error) {
    console.error('Error getting summary history:', error);
    return [];
  }
};

// Get history entry by ID
export const getHistoryEntry = async (historyId) => {
  try {
    const { history } = await loadSummaryHistory();
    return history.find(entry => entry.id === historyId) || null;
  } catch (error) {
    console.error('Error getting history entry:', error);
    return null;
  }
};

// Delete history entry
export const deleteHistoryEntry = async (historyId) => {
  try {
    const { history, metadata } = await loadSummaryHistory();
    
    const entryIndex = history.findIndex(entry => entry.id === historyId);
    if (entryIndex === -1) {
      console.log('History entry not found:', historyId);
      return false;
    }
    
    // Remove from history
    history.splice(entryIndex, 1);
    
    // Remove from metadata
    delete metadata[historyId];
    
    await saveSummaryHistory(history, metadata);
    console.log('History entry deleted:', historyId);
    
    return true;
  } catch (error) {
    console.error('Error deleting history entry:', error);
    throw error;
  }
};

// Clear all history
export const clearAllHistory = async () => {
  try {
    await saveSummaryHistory([], {});
    console.log('All history cleared');
  } catch (error) {
    console.error('Error clearing all history:', error);
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
    console.error('Error getting history stats:', error);
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