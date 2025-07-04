import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// 1. Встраиваем расширение в DOM
function injectExtension() {
  if (document.getElementById("telegram-extension-root")) return;

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

// 2. Ожидаем появления сообщений (не просто одного, а хотя бы нескольких)
function waitForMessages(minCount = 5, timeout = 3000) {
  return new Promise((resolve) => {
    const checkMessages = () => {
      const bubbles = document.querySelectorAll("div.bubble-content");
      if (bubbles.length >= minCount) {
        observer.disconnect();
        clearTimeout(timer);
        resolve();
      }
    };

    const observer = new MutationObserver(checkMessages);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(); // всё равно продолжаем даже если мало сообщений
    }, timeout);

    checkMessages();
  });
}

// 3. Получаем последние сообщения
function getLastMessages(limit = 20) {
  const bubbleNodes = document.querySelectorAll("div.bubble-content");
  const messages = [];

  bubbleNodes.forEach((node) => {
    // Пропускаем цитаты / вложения
    if (node.closest(".reply, .quote-like, .reply-content")) return;

    // Определяем автора — если внутри bubble есть .peer-title, и она НЕ внутри цитаты
    const authorEl = Array.from(node.querySelectorAll(".peer-title")).find(
      (el) => !el.closest(".reply, .quote-like")
    );
    const isMyMessage = !authorEl;
    const author = isMyMessage ? "Вы" : authorEl.innerText.trim();

    // Получаем текст из .message.spoilers-container (это наш контейнер)
    const textEls = node.querySelectorAll(".message.spoilers-container");

    const text = Array.from(textEls)
      .map((el) => {
        const clone = el.cloneNode(true);

        // Удаляем "мусор": таймстемпы, статус, вложения
        const trashSelectors = [
          ".time",
          ".status",
          ".timestamp",
          ".clearfix",
          ".reply-content",
          ".document-wrapper",
        ];
        trashSelectors.forEach((selector) => {
          clone.querySelectorAll(selector).forEach((n) => n.remove());
        });

        return clone.innerText.trim();
      })
      .filter(Boolean) // убираем пустые строки
      .join(" "); // если по какой-то причине в одном bubble несколько контейнеров

    if (text) {
      messages.push({ author, text });
    }
  });

  const lastMessages = messages.slice(-limit);
  console.log("📥 Последние сообщения:", lastMessages);
  return lastMessages;
}

// 4. Старт
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectExtension);
} else {
  injectExtension();
}

waitForMessages().then(() => {
  setTimeout(() => getLastMessages(20), 1000);
});
