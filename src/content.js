import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// Global state for the extension
let extensionRoot = null;
let isExtensionVisible = false;
let messageCache = new Map(); // Cache messages by chat ID
let currentChatId = null;
let isCollectingMessages = false;

let collectionProgress = { current: 0, total: 0 };

// Function to get chat ID from URL or DOM
function getChatId() {
  try {
    // Try to get from URL first
    const urlMatch = window.location.href.match(/\/chat\/(-?\d+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // Try to get from DOM
    const chatElement = document.querySelector('.chat.active');
    if (chatElement) {
      const peerId = chatElement.getAttribute('data-peer-id');
      if (peerId) {
        return peerId;
      }
    }
    
    // Fallback to chat title as ID
    const chatTitle = getCurrentChatTitle();
    return chatTitle !== 'Unknown Chat' ? chatTitle : null;
  } catch (error) {
    console.error('Error getting chat ID:', error);
    return null;
  }
}

// Enhanced function to collect messages by scrolling with progress tracking
async function collectMoreMessages(maxBoundOrCallback = null, progressCallback = null) {
  
  // Handle backward compatibility - if first param is a function, it's the callback
  let actualCallback = null;
  if (typeof maxBoundOrCallback === 'function') {
    actualCallback = maxBoundOrCallback;
  } else if (typeof progressCallback === 'function') {
    actualCallback = progressCallback;
  }
  
  if (isCollectingMessages) {
    return { success: false, reason: 'already_collecting' };
  }
  
  isCollectingMessages = true;
  collectionProgress = { current: 0, total: -1 }; // -1 indicates unknown total
  

  
  try {
    const possibleSelectors = [
      '.bubbles-container .scrollable.scrollable-y', // Chat messages container
      '.chat .scrollable.scrollable-y:not(.folders-sidebar__scrollable)', // Chat area, not sidebar
      '.bubbles-inner .scrollable.scrollable-y', // Inner bubbles container
      '.chat-container .scrollable.scrollable-y', // Chat container
      '.middle-column .scrollable.scrollable-y', // Middle column
      '.scrollable.scrollable-y:not(.folders-sidebar__scrollable)' // Any scrollable except sidebar
    ];
    let scrollableContainer = null;
    for (let selector of possibleSelectors) {
      scrollableContainer = document.querySelector(selector);
      if (scrollableContainer) {
        // Verify this is actually a chat messages container (should have height > 0)
        if (scrollableContainer.scrollHeight > 0 && scrollableContainer.clientHeight > 0) {
          break;
        } else {
          scrollableContainer = null;
        }
      }
    }
    
    // Fallback: look for any scrollable container that contains chat bubbles
    if (!scrollableContainer) {
      const allScrollable = document.querySelectorAll('.scrollable.scrollable-y');
      for (let container of allScrollable) {
        const hasBubbles = container.querySelector('.bubble, .message');
        if (hasBubbles && container.scrollHeight > 0 && container.clientHeight > 0) {
          scrollableContainer = container;
          break;
        }
      }
    }
    
    if (!scrollableContainer) {
      return { success: false, reason: 'no_container' };
    }
    
    let scrollAttempts = 0;
    let lastScrollTop = scrollableContainer.scrollTop;
    let stuckAtTopCount = 0; // Count how many times we're stuck at scrollTop = 0
    const maxStuckAtTop = 3; // Only stop after being stuck at top for 3 attempts
    let noNewMessagesCount = 0; // Count attempts with no new messages
    const maxNoNewMessages = 8; // Stop if no new messages for 8 attempts (increased for safety)
    const initialScrollTop = scrollableContainer.scrollTop;
    
    // Continue scrolling until we reach the top or stop finding new messages
    while (true) {
      scrollAttempts++;
      
      // Update progress
      collectionProgress.current = scrollAttempts;
      if (actualCallback) {
        actualCallback(collectionProgress);
      }
      
      // Parse current messages
      const currentMessages = parseCurrentMessages();
      const currentMessageCount = currentMessages.length;
      
      // Cache new messages  
      const newMessages = cacheMessages(currentMessages);
      

      
      if (actualCallback) {
        actualCallback({
          current: scrollAttempts,
          total: -1, // Unknown total
          messagesFound: currentMessageCount,
          newMessages: newMessages
        });
      }
      
      // Track if we're not finding new messages
      if (newMessages === 0) {
        noNewMessagesCount++;
      } else {
        noNewMessagesCount = 0;
      }
      
      // Check if we've reached the absolute top and are stuck there
      const currentScrollTop = scrollableContainer.scrollTop;
      if (currentScrollTop === 0) {
        stuckAtTopCount++;
        
        if (stuckAtTopCount >= maxStuckAtTop) {
          break;
        }
      } else {
        stuckAtTopCount = 0;
      }
      
      // Stop if we haven't found new messages for several attempts
      if (noNewMessagesCount >= maxNoNewMessages) {
        break;
      }
      
      lastScrollTop = currentScrollTop;
      
      // Calculate scroll amount - more aggressive for faster scrolling
      const scrollAmount = scrollAttempts < 10 ? 8000 : 5000;
      
      const lastScrollHeight = scrollableContainer.scrollHeight;
      scrollableContainer.scrollTop = Math.max(0, scrollableContainer.scrollTop - scrollAmount);
      
      // Dispatch scroll event to trigger any listeners
      scrollableContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
      
      // Dynamic delay: wait for new content to load by checking scrollHeight increase
      let waitAttempts = 0;
      const maxWaitAttempts = 10;
      while (scrollableContainer.scrollHeight <= lastScrollHeight && waitAttempts < maxWaitAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200));
        waitAttempts++;
      }
      
      // Additional minimal delay for rendering
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Return to original position
    scrollableContainer.scrollTop = initialScrollTop;
    
    // Get final message count
    const finalMessages = parseCurrentMessages();
    const finalMessageCount = finalMessages.length;
    
    return {
      success: true,
      attempts: scrollAttempts,
      messagesCollected: finalMessageCount,
      reason: stuckAtTopCount >= maxStuckAtTop ? 'reached_top' : 'no_new_messages'
    };
    
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  } finally {
    isCollectingMessages = false;
    collectionProgress = { current: 0, total: 0 };
  }
}

// Function to get collection progress
function getCollectionProgress() {
  return {
    isCollecting: isCollectingMessages,
    progress: collectionProgress
  };
}



// Enhanced function to parse currently visible messages with better metadata
function parseCurrentMessages() {
  const messagesContainer = document.querySelector('.bubbles-inner.has-rights') || 
                           document.querySelector('.bubbles-inner');
  
  if (!messagesContainer) {
    return [];
  }
  
  const messageElements = messagesContainer.querySelectorAll('.bubble:not(.service)');
  const messages = [];
  
  messageElements.forEach((messageEl, index) => {
    try {
      const messageId = messageEl.getAttribute('data-mid');
      const chatId = getChatId();
      
      // Skip if we've already cached this message
      if (messageId && chatId && messageCache.has(chatId) && messageCache.get(chatId).has(messageId)) {
        return;
      }
      
      const messageTextEl = messageEl.querySelector('.translatable-message') || 
                           messageEl.querySelector('.message');
      
      let messageText = '';
      if (messageTextEl) {
        messageText = messageTextEl.textContent?.trim() || '';
      } else {
        const messageContainer = messageEl.querySelector('.message.spoilers-container');
        if (messageContainer) {
          const clone = messageContainer.cloneNode(true);
          const timeElements = clone.querySelectorAll('.time, .time-inner');
          timeElements.forEach(el => el.remove());
          messageText = clone.textContent?.trim() || '';
        }
      }
      
      if (!messageText || messageText.length < 1) {
        return;
      }
      
      const isIncoming = messageEl.classList.contains('is-in');
      const isOutgoing = messageEl.classList.contains('is-out');
      const timeEl = messageEl.querySelector('.time .i18n') || messageEl.querySelector('.time-inner .i18n');
      const timestamp = timeEl ? timeEl.textContent?.trim() : '';
      const peerId = messageEl.getAttribute('data-peer-id');
      const timestampAttr = messageEl.getAttribute('data-timestamp');
      
      // Enhanced metadata collection
      const messageData = {
        id: messageId,
        text: messageText,
        direction: isIncoming ? 'incoming' : (isOutgoing ? 'outgoing' : 'unknown'),
        timestamp: timestamp,
        messageId: messageId,
        peerId: peerId,
        timestampRaw: timestampAttr,
        element: messageEl,
        cachedAt: Date.now(),
        // Additional metadata for context selection
        wordCount: messageText.split(/\s+/).length,
        charCount: messageText.length,
        hasMedia: !!messageEl.querySelector('.media-container'),
        isForwarded: messageEl.classList.contains('is-forwarded'),
        isReply: !!messageEl.querySelector('.reply'),
        position: index // Position in current view
      };
      
      messages.push(messageData);
      
    } catch (error) {
    }
  });
  
  return messages;
}

// Enhanced function to cache messages with better organization
function cacheMessages(messages) {
  const chatId = getChatId();
  if (!chatId) return;
  
  if (!messageCache.has(chatId)) {
    messageCache.set(chatId, new Map());
  }
  
  const chatCache = messageCache.get(chatId);
  let newMessagesCount = 0;
  
  messages.forEach(message => {
    if (message.id && !chatCache.has(message.id)) {
      chatCache.set(message.id, message);
      newMessagesCount++;
    }
  });
  

  
  // Trigger extension refresh if new messages were cached
  if (newMessagesCount > 0 && isExtensionVisible) {
    renderExtension(true);
  }
}

// Enhanced function to get cached messages with filtering options
function getCachedMessages(options = {}) {
  const chatId = getChatId();
  if (!chatId || !messageCache.has(chatId)) {
    return [];
  }
  
  const chatCache = messageCache.get(chatId);
  let messages = Array.from(chatCache.values());
  
  // Apply filters if provided
  if (options.startIndex !== undefined) {
    messages = messages.slice(options.startIndex);
  }
  if (options.endIndex !== undefined) {
    messages = messages.slice(0, options.endIndex + 1);
  }
  if (options.direction) {
    messages = messages.filter(msg => msg.direction === options.direction);
  }
  if (options.minWordCount) {
    messages = messages.filter(msg => msg.wordCount >= options.minWordCount);
  }
  
  // Sort by timestamp (oldest first for context selection)
  messages.sort((a, b) => {
    const timestampA = parseInt(a.timestampRaw) || 0;
    const timestampB = parseInt(b.timestampRaw) || 0;
    
    if (timestampA !== timestampB) {
      return timestampA - timestampB;
    }
    
    // Fallback to message ID
    const idA = parseInt(a.messageId) || 0;
    const idB = parseInt(b.messageId) || 0;
    return idA - idB;
  });
  
  return messages;
}

// Function to get message statistics for context selection
function getMessageStats() {
  const messages = getCachedMessages();
  if (messages.length === 0) {
    return null;
  }
  
  const totalMessages = messages.length;
  const incomingMessages = messages.filter(m => m.direction === 'incoming').length;
  const outgoingMessages = messages.filter(m => m.direction === 'outgoing').length;
  const totalWords = messages.reduce((sum, m) => sum + m.wordCount, 0);
  const totalChars = messages.reduce((sum, m) => sum + m.charCount, 0);
  const avgWordsPerMessage = totalWords / totalMessages;
  
  // Find date range
  const timestamps = messages.map(m => parseInt(m.timestampRaw)).filter(t => t > 0);
  const oldestTimestamp = Math.min(...timestamps);
  const newestTimestamp = Math.max(...timestamps);
  
  return {
    totalMessages,
    incomingMessages,
    outgoingMessages,
    totalWords,
    totalChars,
    avgWordsPerMessage: Math.round(avgWordsPerMessage),
    oldestTimestamp,
    newestTimestamp,
    dateRange: {
      oldest: new Date(oldestTimestamp * 1000),
      newest: new Date(newestTimestamp * 1000)
    }
  };
}

// Enhanced function to parse chat messages with caching
function parseChat() {
  
  
  const chatTitleElement = document.querySelector('.chat-info .user-title .peer-title') || 
                           document.querySelector('.topbar .chat-info .user-title .peer-title') ||
                           document.querySelector('.sidebar-header.topbar .chat-info .user-title .peer-title');
  
  const chatTitle = chatTitleElement ? chatTitleElement.textContent.trim() : 'Unknown Chat';
  
  
  const chatId = getChatId();
  
  
  // Check if chat changed
  if (chatId !== currentChatId) {

    currentChatId = chatId;
  }
  
  // Get current visible messages and cache them
  const currentMessages = parseCurrentMessages();
  cacheMessages(currentMessages);
  
  // Get all cached messages for this chat
  const allCachedMessages = getCachedMessages();
  
  // Also include currently visible messages that might not be cached yet
  const visibleMessages = currentMessages.filter(msg => 
    !allCachedMessages.some(cached => cached.id === msg.id)
  );
  
  const allMessages = [...allCachedMessages, ...visibleMessages];
  
  
  
  if (allMessages.length === 0) {

    return {
      title: chatTitle,
      chatTitle: chatTitle,
      chatId: chatId,
      messages: [],
      isEmpty: true,
      isLimited: false
    };
  }
  
  // Get message statistics
  const stats = getMessageStats();
  
  return {
    title: chatTitle,
    chatTitle: chatTitle,
    chatId: chatId,
    messages: allMessages,
    totalMessages: allMessages.length,
    isEmpty: false,
    isLimited: allMessages.length < 50 && !isCollectingMessages,
    cachedCount: allCachedMessages.length,
    visibleCount: currentMessages.length,
    stats: stats
  };
}

// Function to get current chat title
function getCurrentChatTitle() {
  try {
    // Try multiple selectors for the active chat title
    const selectors = [
      '.chat-info .user-title .peer-title',
      '.topbar .chat-info .user-title .peer-title', 
      '.sidebar-header.topbar .chat-info .user-title .peer-title',
      '.chat.active .topbar .chat-info .user-title .peer-title'
    ];
    
    for (const selector of selectors) {
      const titleEl = document.querySelector(selector);
      if (titleEl && titleEl.textContent?.trim()) {
        return titleEl.textContent.trim();
      }
    }
    
    return 'Unknown Chat';
  } catch (error) {
    return 'Unknown Chat';
  }
}

// Function to wait for messages to load
function waitForMessages(maxAttempts = 10, interval = 500) {
  return new Promise((resolve) => {
    let attempts = 0;
    
    const checkMessages = () => {
      attempts++;

      
      const messagesContainer = document.querySelector('.bubbles-inner.has-rights') || 
                               document.querySelector('.bubbles-inner');
      
      if (messagesContainer) {
        const messageElements = messagesContainer.querySelectorAll('.bubble:not(.service)');

        
        if (messageElements.length > 0 || attempts >= maxAttempts) {
          resolve(messageElements.length > 0);
          return;
        }
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkMessages, interval);
      } else {
  
        resolve(false);
      }
    };
    
    checkMessages();
  });
}

// Enhanced function to parse chat with retry logic
async function parseChatsWithRetry() {

  
  // Wait for messages to load
  const messagesLoaded = await waitForMessages();
  
  
  // Parse the chat
  const chatData = parseChat();
  
  if (!chatData) {
    
    return null;
  }
  
  
  return chatData;
}

// Function to detect chat changes
function detectChatChange(callback) {
  let currentUrl = window.location.href;
  let currentChatTitle = getCurrentChatTitle();
  let currentMessageCount = 0;
  let chatObserver = null;
  
  // Get current message count
  const updateMessageCount = () => {
    const messagesContainer = document.querySelector('.bubbles-inner.has-rights') || 
                             document.querySelector('.bubbles-inner');
    if (messagesContainer) {
      const messageElements = messagesContainer.querySelectorAll('.bubble:not(.service)');
      currentMessageCount = messageElements.length;
    }
  };
  
  updateMessageCount();
  
  // Check for URL changes (navigation)
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;

      setTimeout(() => {
        updateMessageCount();
        callback('url_change');
      }, 1000); // Delay to allow page to load
    }
  });
  
  // Check for chat title changes (chat switching)
  const titleObserver = new MutationObserver(() => {
    const newChatTitle = getCurrentChatTitle();
    if (newChatTitle !== currentChatTitle && newChatTitle !== 'Unknown Chat') {
      
      currentChatTitle = newChatTitle;
      setTimeout(() => {
        updateMessageCount();
        callback('title_change');
      }, 500);
    }
  });
  
  // Observer for messages container changes (new messages, message updates)
  const setupMessagesObserver = () => {
    if (chatObserver) {
      chatObserver.disconnect();
    }
    
    const messagesContainer = document.querySelector('.bubbles-inner.has-rights') || 
                             document.querySelector('.bubbles-inner');
    
    if (messagesContainer) {

      
      chatObserver = new MutationObserver((mutations) => {
        let hasMessageChanges = false;
        
        mutations.forEach((mutation) => {
          // Check for added or removed message nodes
          if (mutation.type === 'childList') {
            const addedMessages = Array.from(mutation.addedNodes).filter(node => 
              node.nodeType === Node.ELEMENT_NODE && 
              node.classList && 
              node.classList.contains('bubble') && 
              !node.classList.contains('service')
            );
            
            const removedMessages = Array.from(mutation.removedNodes).filter(node => 
              node.nodeType === Node.ELEMENT_NODE && 
              node.classList && 
              node.classList.contains('bubble') && 
              !node.classList.contains('service')
            );
            
            if (addedMessages.length > 0 || removedMessages.length > 0) {
              hasMessageChanges = true;
  
            }
          }
        });
        
        if (hasMessageChanges) {
          const newMessageCount = messagesContainer.querySelectorAll('.bubble:not(.service)').length;
          if (newMessageCount !== currentMessageCount) {
  
            currentMessageCount = newMessageCount;
            // Debounce the callback to avoid too many updates
            setTimeout(() => callback('messages_changed'), 0);
          }
        }
      });
      
      chatObserver.observe(messagesContainer, {
        childList: true,
        subtree: true,
        attributes: false
      });
    } else {

      // Retry setting up the observer after a delay
      setTimeout(setupMessagesObserver, 1000);
    }
  };
  
  // Initial setup
  setupMessagesObserver();
  
  // Start observing for URL and title changes
  urlObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  titleObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also observe the main content area for structural changes
  const mainContentObserver = new MutationObserver((mutations) => {
    let shouldRecheckMessages = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if chat container structure changed
        const addedNodes = Array.from(mutation.addedNodes);
        const removedNodes = Array.from(mutation.removedNodes);
        
        const hasRelevantChanges = [...addedNodes, ...removedNodes].some(node => 
          node.nodeType === Node.ELEMENT_NODE && 
          (node.classList?.contains('chat') || 
           node.classList?.contains('bubbles-inner') ||
           node.querySelector && node.querySelector('.bubbles-inner'))
        );
        
        if (hasRelevantChanges) {
          shouldRecheckMessages = true;
        }
      }
    });
    
    if (shouldRecheckMessages) {

      setTimeout(setupMessagesObserver, 500);
    }
  });
  
  const mainContent = document.querySelector('#column-center') || document.body;
  mainContentObserver.observe(mainContent, {
    childList: true,
    subtree: true
  });
  
  return () => {
    urlObserver.disconnect();
    titleObserver.disconnect();
    mainContentObserver.disconnect();
    if (chatObserver) {
      chatObserver.disconnect();
    }
  };
}

function injectExtension() {
  if (document.getElementById("telegram-extension-root")) {
    return;
  }

  const extensionContainer = document.createElement("div");
  extensionContainer.id = "telegram-extension-root";
  extensionContainer.style.position = "fixed";
  extensionContainer.style.top = "20px";
  extensionContainer.style.right = "20px";
  extensionContainer.style.zIndex = "10000";
  extensionContainer.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  extensionContainer.style.display = "none"; // Initially hidden

  document.body.appendChild(extensionContainer);

  extensionRoot = ReactDOM.createRoot(extensionContainer);
  
  // Start chat change detection
  detectChatChange(async (changeType) => {

    if (isExtensionVisible) {
      // Refresh the extension with new chat data
      await renderExtension();
    }
  });
}

async function renderExtension(forceRefresh = false) {
  if (extensionRoot) {
    try {
      const chatData = await parseChatsWithRetry();
      extensionRoot.render(React.createElement(App, { chatData, onRefreshData: () => renderExtension(true) }));
    } catch (error) {
      // Fallback to basic parsing
      const chatData = parseChat();
      extensionRoot.render(React.createElement(App, { chatData, onRefreshData: () => renderExtension(true) }));
    }
  }
}

async function toggleExtension() {
  const container = document.getElementById("telegram-extension-root");
  if (container) {
    if (isExtensionVisible) {
      container.style.display = "none";
      isExtensionVisible = false;
    } else {
      container.style.display = "block";
      isExtensionVisible = true;
      await renderExtension(); // Render with current chat data
    }
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    toggleExtension();
  }
});

// Expose functions to window for React components
window.collectMoreMessages = collectMoreMessages;
window.getCollectionProgress = getCollectionProgress;
window.getMessageStats = getMessageStats;



if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectExtension);
} else {
  injectExtension();
}

