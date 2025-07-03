import * as React from "react";
import { useEffect, useState } from "react";
import { getSummary } from "../../api/openAi";
import { getMessagesFromTelegram } from "../../Utils/messagesParser";
import { Summary } from "./Summary";

export const SummaryContainer = () => {
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState("Резюме появится после загрузки сообщений");
  const [isLoading, setIsLoading] = useState(false);

  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const messages = getMessagesFromTelegram();
      if (messages.length > 0) {
        console.log("Сообщения найдены:", messages);
        setMessages(messages);
        observer.disconnect(); // отключаем, чтобы не перезапускалось
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;

    setIsLoading(true);
    getSummary(messages, apiKey)
      .then((summary) => {
        if (summary) {
          setSummary(summary)
          console.log("📋 Сгенерированное резюме:", summary);
        }
      })
      .catch((error) => {
        console.error("Ошибка при генерации резюме:", error);
        setSummary("Произошла ошибка при генерации резюме.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [messages, apiKey]);

  return (
    <Summary isLoading={isLoading} summary={summary}/>
  );
};
