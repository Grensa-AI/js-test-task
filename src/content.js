import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { getLastMessages } from "./utils/getLastMessages";

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

// 3. Старт
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectExtension);
} else {
  injectExtension();
}

waitForMessages().then(() => {
  setTimeout(() => getLastMessages(20), 1000);
});
