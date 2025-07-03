import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import './styles/extension-window.css';

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

  document.body.appendChild(extensionContainer);

  const root = ReactDOM.createRoot(extensionContainer);
  root.render(React.createElement(App));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectExtension);
} else {
  injectExtension();
}

// Скрипт для парсинга чатов Telegram Web и извлечения сообщений
class TelegramChatParser {
    constructor() {
      this.currentChatId = null;
      this.isProcessing = false;
      this.observer = null;
      this.init();
    }
  
    init() {
      console.log('Grensa.AI: Content script загружен');
      this.waitForTelegramLoad();
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getChatSummary') {
          this.generateChatSummary().then(sendResponse);
          return true;
        }
      });
    }
  
    waitForTelegramLoad() {
      const checkInterval = setInterval(() => {
        const chatContainer = document.querySelector('.bubbles, .messages-container, .chat-container .messages, [data-testid="messages-container"], .messages-wrapper, .chat-background .messages');
        if (chatContainer) {
          console.log('Grensa.AI: Telegram Web загружен');
          clearInterval(checkInterval);
          this.setupChatObserver();
        }
      }, 1000);
    }
  
    setupChatObserver() {
      let currentUrl = window.location.href;
      const urlObserver = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          this.onChatChange();
        }
      });
      const chatObserver = new MutationObserver((mutations) => {
        const hasNewMessages = mutations.some(mutation => 
          mutation.type === 'childList' && 
          mutation.addedNodes.length > 0
        );
        if (hasNewMessages) {
          this.onChatChange();
        }
      });
      urlObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      const messagesContainer = this.getMessagesContainer();
      if (messagesContainer) {
        chatObserver.observe(messagesContainer, {
          childList: true,
          subtree: true
        });
      }
      this.observer = { urlObserver, chatObserver };
    }
  
    onChatChange() {
      const newChatId = this.getCurrentChatId();
      if (newChatId !== this.currentChatId) {
        console.log('Grensa.AI: Сменился чат', { from: this.currentChatId, to: newChatId });
        this.currentChatId = newChatId;
        chrome.runtime.sendMessage({
          action: 'chatChanged',
          chatId: newChatId
        });
      }
    }
  
    getCurrentChatId() {
      const url = window.location.href;
      const match = url.match(/\/([^/]+)$/);
      if (match) {
        return match[1];
      }
      const chatTitle = document.querySelector('.chat-title, .peer-title, [data-testid="chat-title"]');
      return chatTitle ? chatTitle.textContent.trim() : 'unknown';
    }
  
    getMessagesContainer() {
      const container = document.querySelector('.scrollable.scrollable-y');
      if (container) return container;
      return null;
    }
  
    extractChatMessages = async function() {
      const messages = [];
      const messageSelectors = [
        '.bubble-content-wrapper'
      ];
      let messageElements = [];
      for (const selector of messageSelectors) {
        messageElements = document.querySelectorAll(selector);
        if (messageElements.length > 0) break;
      }
      const messagesCount = 50;
      messageElements.forEach((element, index) => {
        try {
          const messageData = this.parseMessageElement(element);
          if (messageData) {
            messages.push(messageData);
          }
        } catch (error) {
          console.warn('Grensa.AI: Ошибка парсинга сообщения', error);
        }
      });
      return messages.slice(-messagesCount);
    }
  
    parseMessageElement(element) {
      const textElement = element.querySelector('.message.spoilers-container .translatable-message');
      const text = textElement ? textElement.textContent.trim() : '';
      if (!text) return null;
      const senderElement = element.querySelector('.colored-name .peer-title');
      const sender = senderElement ? senderElement.textContent.trim() : 'Unknown';
      const timeElement = element.querySelector('.message.spoilers-container .time .i18n');
      const time = timeElement ? timeElement.textContent.trim() : '';
      const isOutgoing = element.classList.contains('own') || element.classList.contains('outgoing');
      return {
        text,
        sender,
        time,
        isOutgoing,
        timestamp: Date.now()
      };
    }
  
    async generateChatSummary() {
      if (this.isProcessing) {
        return { error: 'Уже обрабатывается запрос' };
      }
      this.isProcessing = true;
      try {
        const messages = await this.extractChatMessages();
        if (messages.length === 0) {
          return { error: 'Сообщения не найдены в чате' };
        }
        console.log('Grensa.AI: Извлечено сообщений:', messages.length);
        const settings = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'getProviderSettings' }, resolve);
        });
        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage({
            action: 'generateSummary',
            messages: messages,
            chatId: this.currentChatId,
            provider: settings.provider,
          }, resolve);
        });
        return response;
      } catch (error) {
        return { error: error.message };
      } finally {
        this.isProcessing = false;
      }
    }
}

new TelegramChatParser();
