import React, { useState, useEffect } from "react";
import { FloatingToggleButton } from "./Components/FloatingToggleButton/FloatingToggleButton";
import { FloatingWindow } from "./Components/FloatingWindow/FloatingWindow";
import { fetchSummaryFromOpenAI } from "./api/openai";
import { getLastMessages } from "./utils/getLastMessages";
import styled from "styled-components";

export const App = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [pos, setPos] = useState({ top: 80, left: 80 });
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

const generateSummary = async () => {
  if (loading) return;

  try {
    setLoading(true);

    // Подождем 1.5 секунды, чтобы Telegram успел отрисовать DOM
    await new Promise((res) => setTimeout(res, 1500));

    const messages = getLastMessages();
    console.log("📥 Полученные сообщения:", messages);

    const result = await fetchSummaryFromOpenAI(messages);
    setSummary(result);
  } catch (err) {
    console.error("Ошибка при генерации резюме:", err);
    setSummary("⚠️ Ошибка при получении резюме.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    generateSummary();
  }, []);

  useEffect(() => {
    // Отслеживаем смену URL (чата)
    let lastUrl = location.href;

    const observer = new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log("🔄 Чат сменился");
        generateSummary();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("extensionPos");
    if (saved) {
      setPos(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--top", `${pos.top}px`);
    document.documentElement.style.setProperty("--left", `${pos.left}px`);
  }, [pos]);

  const handleDrag = (newPos) => {
    setPos(newPos);
    localStorage.setItem("extensionPos", JSON.stringify(newPos));
  };

  const GenerateButton = styled.button`
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 6px;
    font-weight: bold;
    color: white;
    font-size: 18px;
    margin-top: 12px;
    width: 100%;
    border: none;
    cursor: pointer;
    opacity: ${loading ? 0.6 : 1};
  `;

  return (
    <>
      {!isOpen && <FloatingToggleButton onClick={() => setIsOpen(true)} />}
      {isOpen && (
        <FloatingWindow
          onClose={() => setIsOpen(false)}
          onDrag={handleDrag}
          summary={summary}
          loading={loading}
        >
          <GenerateButton onClick={generateSummary} disabled={loading}>
            {loading ? "Генерация..." : "Сгенерировать резюме"}
          </GenerateButton>
        </FloatingWindow>
      )}
    </>
  );
};
