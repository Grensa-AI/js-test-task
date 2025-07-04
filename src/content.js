import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

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

// Получение id чата из HTML тега
function getChatId() {
  const chatId = document.querySelectorAll('.top')[0]?.lastChild?.lastChild?.dataset?.peerId;
  return chatId ? chatId : null;
}

// Парсим сообщения из Telegram Web
function parseTelegramChat() {
  const messageElements = document.querySelectorAll('.message');
  const messages = [];

  messageElements.forEach(messageElement => {
    // Убираем не нужную информацию
    const clone = messageElement.cloneNode(true);
    const timeElement = clone.querySelector('span.time');
    if (timeElement) {
      timeElement.remove();
    }
    const messageText = clone.textContent.trim();
    if (messageText) {
      messages.push(messageText);
    }
  });

  return messages;
}

// Отправляем сообщения в React, создавая событие TELEGRAM_CHAT
function sendChatToReact() {
  const messages = parseTelegramChat();
  window.postMessage({ type: "TELEGRAM_CHAT", payload: messages }, "*");
}

let lastChatId = null;

// Ежевременно вызываем парсер, проверяя текущий chatId
if (window.location.host.includes("web.telegram.org")) {
  setInterval(() => {
    const chatId = getChatId();
    if (chatId && chatId !== lastChatId) {
      lastChatId = chatId;
      sendChatToReact();
    }
  }, 2000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectExtension);
} else {
  injectExtension();
}
