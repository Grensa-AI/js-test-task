import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

console.log("Grensa Extension: content script loaded")

export function extractMessages() {
	const msgEls = document.querySelectorAll('.message.spoilers-container')

	const messages = Array.from(msgEls)
		.map((el) => {
			const cloned = el.cloneNode(true)
			const time = cloned.querySelector('.time')
			if (time) time.remove()
			const clearfix = cloned.querySelector('.clearfix')
			if (clearfix) clearfix.remove()
			return cloned.innerText.trim()
		})
		.filter(Boolean)

	console.log('Извлечённые сообщения:', messages)
	return messages
}

function startMessagePolling() {
	extractMessages();
	setInterval(() => {
		extractMessages();
	}, 3000);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", startMessagePolling);
} else {
	startMessagePolling();
}


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

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", injectExtension);
} else {
	injectExtension();
}

