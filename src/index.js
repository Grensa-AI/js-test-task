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
