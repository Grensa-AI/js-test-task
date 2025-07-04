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
    try {
      setLoading(true);
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
