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

// 2. Старт
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectExtension);
} else {
  injectExtension();
}
