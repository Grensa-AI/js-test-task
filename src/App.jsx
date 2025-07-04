import React, { useState, useEffect } from "react";
import { FloatingToggleButton } from "./Components/FloatingToggleButton/FloatingToggleButton";
import { FloatingWindow } from "./Components/FloatingWindow/FloatingWindow";
import { fetchSummaryFromOpenAI } from "./api/openai";
import { getLastMessages } from "./utils/getLastMessages";

export const App = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [pos, setPos] = useState({ top: 80, left: 80 });
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => {
    const messages = getLastMessages();
    console.log("📥 Полученные сообщения:", messages);

    setLoading(true); // 🔼 перемещено выше

    fetchSummaryFromOpenAI(messages)
      .then((result) => setSummary(result))
      .catch((err) => {
        console.error("Ошибка при генерации резюме:", err);
        setSummary("⚠️ Ошибка при получении резюме.");
      })
      .finally(() => setLoading(false));
  }, 3000);

  return () => clearTimeout(timer);
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

  return (
    <>
      {!isOpen && <FloatingToggleButton onClick={() => setIsOpen(true)} />}
      {isOpen && (
        <FloatingWindow
          onClose={() => setIsOpen(false)}
          onDrag={handleDrag}
          summary={summary}
          loading={loading}
        />
      )}
    </>
  );
};
