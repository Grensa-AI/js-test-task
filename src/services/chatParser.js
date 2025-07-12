// Сервис для парсинга чатов в Telegram Web
class ChatParser {
  constructor() {
    this.currentChatId = null;
    this.messageObserver = null;
  }

  // Получение текущего ID чата
  getCurrentChatId() {
    // Пытаемся получить ID из URL
    const url = window.location.href;
    const match = url.match(/\/c\/(\d+)/);
    if (match) return match[1];

    // Альтернативный способ - из заголовка чата
    const chatTitle = document.querySelector('.chat-header .chat-title');
    if (chatTitle) {
      return this.hashCode(chatTitle.textContent);
    }

    return null;
  }

  // Простая хеш-функция для генерации ID
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }

  // Парсинг сообщений из DOM
  parseMessages() {
    const messages = [];
    
    // Селекторы для разных типов сообщений в Telegram Web
    const messageSelectors = [
      '.message:not(.service)',
      '.bubble:not(.service)',
      '[data-message-id]',
      '.message-list-item'
    ];

    let messageElements = [];
    
    // Пробуем разные селекторы
    for (const selector of messageSelectors) {
      messageElements = document.querySelectorAll(selector);
      if (messageElements.length > 0) break;
    }

    // Если не нашли сообщения, пробуем альтернативные селекторы
    if (messageElements.length === 0) {
      messageElements = document.querySelectorAll('[class*="message"]');
    }

    messageElements.forEach((element, index) => {
      try {
        const message = this.extractMessageData(element);
        if (message && message.text && message.text.trim().length > 0) {
          messages.push(message);
        }
      } catch (error) {
        console.warn('Ошибка при парсинге сообщения:', error);
      }
    });

    // Ограничиваем количество сообщений для анализа
    return messages.slice(-50); // Последние 50 сообщений
  }

  // Извлечение данных из элемента сообщения
  extractMessageData(element) {
    const message = {};

    // Извлечение текста сообщения
    const textSelectors = [
      '.message-text',
      '.bubble-content',
      '.text-content',
      '[class*="text"]',
      'p',
      'span'
    ];

    for (const selector of textSelectors) {
      const textElement = element.querySelector(selector);
      if (textElement && textElement.textContent.trim()) {
        message.text = textElement.textContent.trim();
        break;
      }
    }

    // Если не нашли текст, пробуем получить из самого элемента
    if (!message.text) {
      message.text = element.textContent.trim();
    }

    // Извлечение имени отправителя
    const senderSelectors = [
      '.message-sender',
      '.sender-name',
      '.user-name',
      '[class*="sender"]',
      '[class*="user"]'
    ];

    for (const selector of senderSelectors) {
      const senderElement = element.querySelector(selector);
      if (senderElement && senderElement.textContent.trim()) {
        message.sender = senderElement.textContent.trim();
        break;
      }
    }

    // Если не нашли отправителя, используем дефолтное значение
    if (!message.sender) {
      message.sender = 'Пользователь';
    }

    // Извлечение времени
    const timeSelectors = [
      '.message-time',
      '.time',
      '[class*="time"]',
      'time'
    ];

    for (const selector of timeSelectors) {
      const timeElement = element.querySelector(selector);
      if (timeElement && timeElement.textContent.trim()) {
        message.time = timeElement.textContent.trim();
        break;
      }
    }

    // Если не нашли время, используем текущее
    if (!message.time) {
      message.time = new Date().toLocaleTimeString();
    }

    return message;
  }

  // Настройка наблюдателя за изменениями в чате
  setupMessageObserver(callback) {
    // Очищаем предыдущий наблюдатель
    if (this.messageObserver) {
      this.messageObserver.disconnect();
    }

    // Ищем контейнер с сообщениями
    const chatContainer = this.findChatContainer();
    if (!chatContainer) {
      console.warn('Не удалось найти контейнер чата');
      return;
    }

    // Создаем новый наблюдатель
    this.messageObserver = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Проверяем, добавились ли новые сообщения
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const isMessage = this.isMessageElement(node);
              if (isMessage) {
                shouldUpdate = true;
                break;
              }
            }
          }
        }
      });

      if (shouldUpdate) {
        // Дебаунс для избежания частых обновлений
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          callback();
        }, 1000);
      }
    });

    // Начинаем наблюдение
    this.messageObserver.observe(chatContainer, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
  }

  // Поиск контейнера чата
  findChatContainer() {
    const containerSelectors = [
      '.chat-container',
      '.message-list',
      '.messages-container',
      '[class*="chat"]',
      '[class*="message"]'
    ];

    for (const selector of containerSelectors) {
      const container = document.querySelector(selector);
      if (container) return container;
    }

    // Если не нашли, возвращаем body
    return document.body;
  }

  // Проверка, является ли элемент сообщением
  isMessageElement(element) {
    if (!element || !element.classList) return false;
    
    const messageClasses = ['message', 'bubble', 'message-list-item'];
    return messageClasses.some(className => 
      element.classList.contains(className) || 
      element.className.includes(className)
    );
  }

  // Очистка наблюдателя
  cleanup() {
    if (this.messageObserver) {
      this.messageObserver.disconnect();
      this.messageObserver = null;
    }
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }

  // Проверка, изменился ли чат
  hasChatChanged() {
    const newChatId = this.getCurrentChatId();
    if (newChatId !== this.currentChatId) {
      this.currentChatId = newChatId;
      return true;
    }
    return false;
  }
}

export const chatParser = new ChatParser(); 