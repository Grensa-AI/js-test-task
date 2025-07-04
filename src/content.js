/**
 * content.js - "Глаза" расширения Grensa.AI
 * 
 * Этот файл внедряется прямо в страницу Telegram Web, как будто он стал частью
 * самой страницы. Он "видит" все, что происходит на странице Telegram.
 * 
 * Что здесь происходит:
 * 1. Следит за тем, в каком чате находится пользователь
 * 2. Когда пользователь переходит в другой чат, сообщает об этом background.js
 * 3. Когда нужно проанализировать чат:
 *    - Находит все сообщения на странице (как будто читает их глазами)
 *    - Собирает текст сообщений, имена отправителей, время
 *    - Отправляет эту информацию в background.js для анализа ИИ
 * 4. Создает плавающую кнопку на странице для открытия окна расширения
 * 5. Делает окно расширения перетаскиваемым по экрану
 * 
 * Это как шпион, который сидит на странице Telegram и все подмечает,
 * но делает это для хороших целей - чтобы помочь пользователю понять,
 * о чем говорили в чате.
 * 
 * Работает только на страницах web.telegram.org
 */

// src/content.js
// Скрипт для парсинга чатов Telegram Web и извлечения сообщений

// import './styles/content-extension.css';
import './styles/extension-window.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import Summary from './Components/Summary/Summary';

class TelegramChatParser {
    constructor() {
      this.currentChatId = null;
      this.isProcessing = false;
      this.observer = null;
      this.init();
    }
  
    init() {
    
      
      // Ждем загрузки Telegram Web
      this.waitForTelegramLoad();
      
      // Слушаем сообщения от popup
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
  
          clearInterval(checkInterval);
          this.setupChatObserver();
          
      
          createFloatingButton();
          setTimeout(makeExtensionDraggable, 1000);
        }
      }, 1000);
    }
  
    setupChatObserver() {
      // Отслеживаем смену чатов по изменению URL
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
  
      // Наблюдаем за изменениями URL
      urlObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
  
      // Наблюдаем за контейнером сообщений
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

        this.currentChatId = newChatId;
        
        // Уведомляем popup о смене чата
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
      // Используем актуальный селектор для Telegram Web
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
      // Извлекаем текст сообщения
      const textElement = element.querySelector('.message.spoilers-container .translatable-message');
      const text = textElement ? textElement.textContent.trim() : '';
      if (!text) return null;
      // Извлекаем имя отправителя
      const senderElement = element.querySelector('.colored-name .peer-title');
      const sender = senderElement ? senderElement.textContent.trim() : 'Unknown';
      // Извлекаем время
      const timeElement = element.querySelector('.message.spoilers-container .time .i18n');
      const time = timeElement ? timeElement.textContent.trim() : '';
      // Определяем направление сообщения (входящее/исходящее)
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
  
    
  
        // Получаем актуальные настройки
        const settings = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'getProviderSettings' }, resolve);
        });
  
        
        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage({
            action: 'generateSummary',
            messages: messages,
            chatId: this.currentChatId,
            provider: settings.provider,
            model: settings.model,
            apiKey: settings.apiKey
          }, resolve);
        });
  
        return response;
  
      } catch (error) {
        console.error('Grensa.AI: Ошибка генерации резюме:', error);
        return { error: 'Ошибка при генерации резюме: ' + error.message };
      } finally {
        this.isProcessing = false;
      }
    }
  }
  
  
  const telegramParser = new TelegramChatParser();
  
  
  function createFloatingButton() {
    if (document.getElementById('grensa-floating-btn')) return;

    const btn = document.createElement('div');
    btn.id = 'grensa-floating-btn';
    btn.className = 'grensa-floating-btn';
    btn.title = 'Открыть Grensa.AI';
    
    btn.style.position = 'fixed';
    btn.style.top = '100px';
    btn.style.right = '30px';
    btn.style.width = '48px';
    btn.style.height = '48px';
    btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    btn.style.borderRadius = '50%';
    btn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.cursor = 'pointer';
    btn.style.userSelect = 'none';
    btn.style.transition = 'box-shadow 0.2s';
    btn.style.border = '2px solid #fff';
    btn.style.fontSize = '24px';
    btn.style.color = '#fff';
    btn.style.fontWeight = 'bold';
    btn.style.zIndex = '2147483647';

    // Drag & drop только по вертикали
    let isDragging = false, offsetY = 0;
    btn.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetY = e.clientY - btn.getBoundingClientRect().top;
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      let top = e.clientY - offsetY;
      top = Math.max(10, Math.min(window.innerHeight - btn.offsetHeight - 10, top));
      btn.style.top = top + 'px';
      sessionStorage.setItem('grensa-btn-top', btn.style.top);
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
      document.body.style.userSelect = '';
    });

    btn.addEventListener('click', (e) => {
      if (isDragging) return;
      chrome.runtime.sendMessage({ action: 'getProviderSettings' }, (settings) => {

        if (settings && settings.provider && settings.model && settings.apiKey) {
          let ext = document.getElementById('telegram-extension-root');
          if (!ext) {
            ext = document.createElement('div');
            ext.id = 'telegram-extension-root';
            ext.className = 'grensa-window-root';
            ext.style.position = 'fixed';
            ext.style.top = '100px';
            ext.style.left = '90px';
            ext.style.right = '';
            ext.style.zIndex = '2147483647';
            
            document.body.appendChild(ext);
            const root = ReactDOM.createRoot(ext);
            root.render(<App />);
            setTimeout(makeExtensionDraggable, 100);
          } else {
            
            const computed = getComputedStyle(ext).display;
            if (ext.style.display === 'none' || computed === 'none') {
              ext.style.display = '';
            } else {
              ext.style.display = 'none';
            }
          }
        } else {
          showGrensaHint('Перейдите в настройки расширения и введите API-ключ и модель для выбранного провайдера.');
        }
      });
    });

    
    const savedTop = sessionStorage.getItem('grensa-btn-top');
    if (savedTop) btn.style.top = savedTop;

    
    document.body.appendChild(btn);
  }
  
  
  setInterval(() => {
    if (!document.getElementById('grensa-floating-btn')) {
      createFloatingButton();
    }
  }, 2000);
  
  function showGrensaHint(text) {
    let hint = document.getElementById('grensa-hint-popup');
    if (hint) {
      hint.textContent = text;
      hint.style.display = 'block';
      setTimeout(() => { hint.style.display = 'none'; }, 4000);
      return;
    }
    hint = document.createElement('div');
    hint.id = 'grensa-hint-popup';
    hint.textContent = text;
    hint.style.position = 'fixed';
    hint.style.top = '80px';
    hint.style.right = '90px';
    hint.style.zIndex = '10010';
    hint.style.background = 'rgba(40,40,60,0.98)';
    hint.style.color = '#fff';
    hint.style.padding = '18px 28px';
    hint.style.borderRadius = '12px';
    hint.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    hint.style.fontSize = '16px';
    hint.style.maxWidth = '340px';
    hint.style.textAlign = 'center';
    hint.style.transition = 'opacity 0.2s';
    document.body.appendChild(hint);
    setTimeout(() => { hint.style.display = 'none'; }, 4000);
  }
  
  
  function makeExtensionDraggable() {
    const ext = document.getElementById('telegram-extension-root');
    if (!ext) {
      return;
    }
    // Drag-зона только по шапке
    let dragHeader = ext.querySelector('.grensa-window-header');
    if (!dragHeader) {
      console.warn('Grensa.AI: Не найдена .grensa-window-header для drag');
      return;
    }
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0, startX = 0, startY = 0, startTranslateX = 0, startTranslateY = 0;
    
    function getCurrentTranslate() {
      const style = window.getComputedStyle(ext);
      const matrix = new DOMMatrixReadOnly(style.transform);
      return {
        x: matrix.m41,
        y: matrix.m42
      };
    }
    dragHeader.onmousedown = (e) => {
      if (e.target.closest('.grensa-window-close')) return;
      isDragging = true;
      document.body.style.userSelect = 'none';
      ext.style.position = 'fixed';
      // Получаем текущий translate
      const { x, y } = getCurrentTranslate();
      startTranslateX = x;
      startTranslateY = y;
      startX = e.clientX;
      startY = e.clientY;
      dragOffsetX = startX - (ext.getBoundingClientRect().left);
      dragOffsetY = startY - (ext.getBoundingClientRect().top);
      ext.classList.add('dragging');
    };
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      // Новые координаты мыши
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newX = startTranslateX + dx;
      let newY = startTranslateY + dy;
      // Ограничиваем перемещение в пределах окна браузера
      newX = Math.max(0, Math.min(window.innerWidth - ext.offsetWidth, newX));
      newY = Math.max(0, Math.min(window.innerHeight - ext.offsetHeight, newY));
      ext.style.transform = `translate(${newX}px, ${newY}px)`;
    });
    document.addEventListener('mouseup', () => {

      isDragging = false;
      document.body.style.userSelect = '';
      ext.classList.remove('dragging');
    });
    
    const closeBtn = ext.querySelector('button[title="Закрыть"]');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        ext.style.display = 'none';
      };
    }
  }
  
  
  window.GrensaContentScript = true;
  