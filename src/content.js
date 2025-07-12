import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// Global state for the extension
let extensionRoot = null;
let isExtensionVisible = false;
let messageCache = new Map(); // Cache messages by chat ID
let currentChatId = null;
let isCollectingMessages = false;

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

// Function to collect messages by scrolling
async function collectMoreMessages(maxScrollAttempts = 5) {
  if (isCollectingMessages) {
    console.log('Already collecting messages, skipping...');
    return;
  }
  
  isCollectingMessages = true;
  console.log('Starting message collection by scrolling...');
  
  try {
    const scrollableContainer = document.querySelector('.scrollable.scrollable-y');
    if (!scrollableContainer) {
      console.log('Scrollable container not found');
      return;
    }
    
    let scrollAttempts = 0;
    let previousMessageCount = 0;
    
    while (scrollAttempts < maxScrollAttempts) {
      // Get current messages and cache them
      const currentMessages = parseCurrentMessages();
      cacheMessages(currentMessages);
      
      const currentCount = currentMessages.length;
      console.log(`Scroll attempt ${scrollAttempts + 1}: Found ${currentCount} messages`);
      
      // If no new messages found, break
      if (currentCount === previousMessageCount && scrollAttempts > 0) {
        console.log('No new messages found, stopping collection');
        break;
      }
      
      previousMessageCount = currentCount;
      
      // Scroll up to load older messages
      scrollableContainer.scrollTop = Math.max(0, scrollableContainer.scrollTop - 1000);
      
      // Wait for messages to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      scrollAttempts++;
    }
    
    // Scroll back to bottom
    scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
    
    console.log(`Message collection completed. Total attempts: ${scrollAttempts}`);
    
  } catch (error) {
    console.error('Error during message collection:', error);
  } finally {
    isCollectingMessages = false;
  }
}

// Function to parse currently visible messages
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
      
      const messageData = {
        id: messageId,
        text: messageText,
        direction: isIncoming ? 'incoming' : (isOutgoing ? 'outgoing' : 'unknown'),
        timestamp: timestamp,
        messageId: messageId,
        peerId: peerId,
        timestampRaw: timestampAttr,
        element: messageEl,
        cachedAt: Date.now()
      };
      
      messages.push(messageData);
      
    } catch (error) {
      console.error(`Error parsing message ${index}:`, error);
    }
  });
  
  return messages;
}

// Function to cache messages for current chat
function cacheMessages(messages) {
  const chatId = getChatId();
  if (!chatId) return;
  
  if (!messageCache.has(chatId)) {
    messageCache.set(chatId, new Map());
  }
  
  const chatCache = messageCache.get(chatId);
  
  messages.forEach(message => {
    if (message.id) {
      chatCache.set(message.id, message);
    }
  });
  
  console.log(`Cached ${messages.length} messages for chat ${chatId}. Total cached: ${chatCache.size}`);
}

// Function to get cached messages for current chat
function getCachedMessages() {
  const chatId = getChatId();
  if (!chatId || !messageCache.has(chatId)) {
    return [];
  }
  
  const chatCache = messageCache.get(chatId);
  const messages = Array.from(chatCache.values());
  
  // Sort by timestamp (newest first, then by message ID)
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

// Enhanced function to parse chat messages with caching
function parseChat() {
  console.log('Parsing chat messages with caching...');
  
  const chatTitleElement = document.querySelector('.chat-info .user-title .peer-title') || 
                           document.querySelector('.topbar .chat-info .user-title .peer-title') ||
                           document.querySelector('.sidebar-header.topbar .chat-info .user-title .peer-title');
  
  const chatTitle = chatTitleElement ? chatTitleElement.textContent.trim() : 'Unknown Chat';
  console.log('Chat title found:', chatTitle);
  
  const chatId = getChatId();
  console.log('Chat ID:', chatId);
  
  // Check if chat changed
  if (chatId !== currentChatId) {
    console.log(`Chat changed from ${currentChatId} to ${chatId}`);
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
  
  console.log(`Total messages: ${allMessages.length} (${allCachedMessages.length} cached + ${visibleMessages.length} visible)`);
  
  if (allMessages.length === 0) {
    console.log('No messages found - chat might be empty or still loading');
    return {
      title: chatTitle,
      chatTitle: chatTitle,
      messages: [],
      isEmpty: true,
      isLimited: false
    };
  }
  
  // Determine if we have limited message scope
  const isLimited = allMessages.length < 50 && !isCollectingMessages; // Assume limited if less than 50 messages
  
  return {
    title: chatTitle,
    chatTitle: chatTitle,
    messages: allMessages,
    totalMessages: allMessages.length,
    isEmpty: false,
    isLimited: isLimited,
    cachedCount: allCachedMessages.length,
    visibleCount: currentMessages.length
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
    console.error('Error getting chat title:', error);
    return 'Unknown Chat';
  }
}

// Function to wait for messages to load
function waitForMessages(maxAttempts = 10, interval = 500) {
  return new Promise((resolve) => {
    let attempts = 0;
    
    const checkMessages = () => {
      attempts++;
      console.log(`Checking for messages, attempt ${attempts}/${maxAttempts}`);
      
      const messagesContainer = document.querySelector('.bubbles-inner.has-rights') || 
                               document.querySelector('.bubbles-inner');
      
      if (messagesContainer) {
        const messageElements = messagesContainer.querySelectorAll('.bubble:not(.service)');
        console.log(`Found ${messageElements.length} messages on attempt ${attempts}`);
        
        if (messageElements.length > 0 || attempts >= maxAttempts) {
          resolve(messageElements.length > 0);
          return;
        }
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkMessages, interval);
      } else {
        console.log('Max attempts reached, proceeding anyway');
        resolve(false);
      }
    };
    
    checkMessages();
  });
}

// Enhanced function to parse chat with retry logic
async function parseChatsWithRetry() {
  console.log('Starting enhanced chat parsing with retry logic...');
  
  // Wait for messages to load
  const messagesLoaded = await waitForMessages();
  console.log('Messages loaded:', messagesLoaded);
  
  // Parse the chat
  const chatData = parseChat();
  
  if (!chatData) {
    console.log('No chat data found');
    return null;
  }
  
  console.log('Final chat data:', chatData);
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
      console.log('URL changed, new chat detected');
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
      console.log(`Chat title changed from "${currentChatTitle}" to "${newChatTitle}"`);
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
      console.log('Setting up messages observer on container:', messagesContainer);
      
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
              console.log(`Message changes detected: +${addedMessages.length} -${removedMessages.length}`);
            }
          }
        });
        
        if (hasMessageChanges) {
          const newMessageCount = messagesContainer.querySelectorAll('.bubble:not(.service)').length;
          if (newMessageCount !== currentMessageCount) {
            console.log(`Message count changed from ${currentMessageCount} to ${newMessageCount}`);
            currentMessageCount = newMessageCount;
            // Debounce the callback to avoid too many updates
            setTimeout(() => callback('messages_changed'), 100);
          }
        }
      });
      
      chatObserver.observe(messagesContainer, {
        childList: true,
        subtree: true,
        attributes: false
      });
    } else {
      console.log('Messages container not found, will retry...');
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
      console.log('Chat structure changed, re-setting up messages observer');
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
    console.log('Chat change detected:', changeType);
    if (isExtensionVisible) {
      // Refresh the extension with new chat data
      await renderExtension();
    }
  });
}

async function renderExtension(forceRefresh = false) {
  if (extensionRoot) {
    try {
      console.log('Rendering extension with enhanced parsing...', forceRefresh ? '(forced refresh)' : '');
      const chatData = await parseChatsWithRetry();
      console.log('Chat data for extension:', chatData);
      extensionRoot.render(React.createElement(App, { chatData, onRefreshData: () => renderExtension(true) }));
    } catch (error) {
      console.error('Error rendering extension:', error);
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

console.log('Telegram Web Extension content script loaded');

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectExtension);
} else {
  injectExtension();
}
