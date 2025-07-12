import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { openAIService } from "./services/openaiService";
import { chatParser } from "./services/chatParser";

// Глобальные переменные
let extensionRoot = null;
let isExtensionVisible = false;
let currentAnalysis = null;

// Основная функция анализа чата
async function analyzeChat() {
  try {
    // Проверяем, изменился ли чат
    if (chatParser.hasChatChanged()) {
      console.log('Обнаружена смена чата, начинаем анализ...');
    }

    // Парсим сообщения
    const messages = chatParser.parseMessages();
    
    if (messages.length === 0) {
      console.log('Сообщения не найдены');
      updateExtensionUI({ 
        type: 'SUMMARY_UPDATE', 
        summary: 'Сообщения в чате не найдены. Убедитесь, что чат открыт и содержит сообщения.' 
      });
      return;
    }

    console.log(`Найдено ${messages.length} сообщений для анализа`);

    // Отправляем состояние загрузки
    updateExtensionUI({ type: 'SUMMARY_LOADING' });

    // Генерируем резюме
    const summary = await openAIService.generateChatSummary(messages);
    
    // Обновляем UI с результатом
    updateExtensionUI({ 
      type: 'SUMMARY_UPDATE', 
      summary: summary 
    });

  } catch (error) {
    console.error('Ошибка при анализе чата:', error);
    updateExtensionUI({ 
      type: 'SUMMARY_ERROR', 
      error: error.message 
    });
  }
}

// Обновление UI расширения
function updateExtensionUI(data) {
  if (extensionRoot) {
    chrome.runtime.sendMessage(data);
  }
}

// Внедрение расширения в страницу
function injectExtension() {
  if (document.getElementById("telegram-extension-root")) {
    return;
  }

  // Создаем контейнер для расширения
  const extensionContainer = document.createElement("div");
  extensionContainer.id = "telegram-extension-root";
  
  // Стили для контейнера
  extensionContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `;

  document.body.appendChild(extensionContainer);
  
  // Создаем React root
  extensionRoot = ReactDOM.createRoot(extensionContainer);
  extensionRoot.render(React.createElement(App));
}

// Показ/скрытие расширения
function toggleExtension() {
  const container = document.getElementById("telegram-extension-root");
  if (!container) return;

  isExtensionVisible = !isExtensionVisible;
  container.style.display = isExtensionVisible ? "block" : "none";

  if (isExtensionVisible) {
    // Запускаем анализ при показе расширения
    setTimeout(analyzeChat, 500);
  }
}

// Настройка наблюдателя за изменениями в чате
function setupChatObserver() {
  // Настраиваем наблюдатель через chatParser
  chatParser.setupMessageObserver(() => {
    if (isExtensionVisible) {
      console.log('Обнаружены новые сообщения, обновляем анализ...');
      analyzeChat();
    }
  });

  // Наблюдаем за изменениями URL (смена чата)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('URL изменился, возможно сменился чат');
      if (isExtensionVisible) {
        setTimeout(analyzeChat, 1000);
      }
    }
  }).observe(document, { subtree: true, childList: true });
}

// Обработка сообщений от popup и background
function handleMessages(message, sender, sendResponse) {
  console.log('Получено сообщение:', message);

  switch (message.action) {
    case 'toggle':
      toggleExtension();
      break;
      
    case 'refresh_summary':
      if (isExtensionVisible) {
        analyzeChat();
      }
      break;
      
    case 'api_key_updated':
      // Обновляем состояние после изменения API ключа
      if (isExtensionVisible) {
        setTimeout(analyzeChat, 500);
      }
      break;
      
    default:
      console.log('Неизвестное действие:', message.action);
  }
}

// Инициализация расширения
function initializeExtension() {
  console.log('Инициализация расширения Grensa.AI...');
  
  // Внедряем расширение
  injectExtension();
  
  // Настраиваем наблюдатели
  setTimeout(() => {
    setupChatObserver();
  }, 2000);
  
  // Слушаем сообщения
  chrome.runtime.onMessage.addListener(handleMessages);
  
  console.log('Расширение инициализировано');
}

// Запуск инициализации после загрузки страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Очистка при выгрузке страницы
window.addEventListener('beforeunload', () => {
  if (chatParser) {
    chatParser.cleanup();
  }
});