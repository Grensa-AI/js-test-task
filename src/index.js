/**
 * index.js - Точка входа в расширение Grensa.AI
 * 
 * Этот файл - как главная дверь в дом. Когда браузер запускает расширение,
 * он первым делом читает именно этот файл.
 * 
 * Что здесь происходит:
 * 1. Проверяет, где именно открывается расширение:
 *    - Если это страница настроек (chrome-extension://...) - показывает OptionsApp
 *    - Если это обычное окно расширения - показывает App
 * 2. Создает корневой элемент React (как фундамент для всего интерфейса)
 * 3. Запускает нужное приложение (настройки или основное окно)
 * 
 * Это как диспетчер - он решает, что именно показать пользователю
 * в зависимости от того, как и где было открыто расширение.
 * 
 * Очень простой файл, но очень важный - без него ничего не заработает.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { OptionsApp } from "./OptionsApp";

const root = ReactDOM.createRoot(document.getElementById("root"));

if (window.location.href.includes('chrome-extension') || window.location.href.includes('extension://')) {
  root.render(<OptionsApp />);
} else {
  root.render(<App />);
}
