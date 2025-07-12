import React from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { App } from "./App";
import i18n from "./i18n";

// Debug log to check i18n instance at startup
console.log('i18n instance at startup:', i18n);
console.log('i18n.changeLanguage at startup:', typeof i18n?.changeLanguage);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);
