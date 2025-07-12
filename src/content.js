import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
let currentChatId = null

function getCurrentChatId() {
  const path = window.location.pathname
  const match = path.match(/\/k\/(\d+)/)
  return match ? match[1] : null
}

function observeChatChanges(callback) {
  const observer = new MutationObserver(() => {
    const newChatId = getCurrentChatId()
    if (newChatId && newChatId !== currentChatId) {
      currentChatId = newChatId
      callback()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  })

  return observer
}

function getChatMessages() {
  const messageElements = document.querySelectorAll(".message:not(.service)")
  const messages = []

  messageElements.forEach((el) => {
    const senderElement = el.querySelector(".message-sender-name")
    const textElement = el.querySelector(".message-text")

    if (senderElement && textElement) {
      messages.push({
        sender: senderElement.textContent.trim(),
        text: textElement.textContent.trim(),
      })
    }
  })

  return messages
}

async function generateChatSummary(messages) {
  try {
    const prompt = `Создай краткое резюме этого чата на основе следующих сообщений:\n\n${messages.map((m) => `${m.sender}: ${m.text}`).join("\n")}\n\nРезюме:`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    return data.choices[0]?.message?.content || "Не удалось сгенерировать резюме"
  } catch (error) {
    console.error("Ошибка при запросе к OpenAI:", error)
    return "Произошла ошибка при генерации резюме"
  }
}

function injectExtension() {
  if (document.getElementById("telegram-extension-root")) return

  const extensionContainer = document.createElement("div")
  extensionContainer.id = "telegram-extension-root"
  extensionContainer.style.position = "fixed"
  extensionContainer.style.top = "20px"
  extensionContainer.style.right = "20px"
  extensionContainer.style.zIndex = "10000"
  extensionContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  document.body.appendChild(extensionContainer)

  document.body.appendChild(extensionContainer)

  const root = ReactDOM.createRoot(extensionContainer)
  const app = React.createElement(App, {
    onGenerateSummary: async () => {
      const messages = getChatMessages()
      return await generateChatSummary(messages)
    },
  })
  root.render(app)

  // начинаем наблюдение за сменой чатов
  currentChatId = getCurrentChatId()
  observeChatChanges(() => {
    root.unmount()
    injectExtension() // пересоздаем расширение для нового чата
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectExtension)
} else {
  injectExtension()
}
