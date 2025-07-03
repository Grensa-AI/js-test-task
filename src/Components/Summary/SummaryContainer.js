import * as React from "react";
import { useState } from "react";
import { getMessagesFromTelegram } from "../../Utils/messagesParser";
import { Summary } from "./Summary";
import { getSummary } from "../../api/cohere";

export const SummaryContainer = () => {
  const [summary, setSummary] = useState("Резюме появится после загрузки сообщений");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  const apiKey = process.env.REACT_APP_COHERE_API_KEY;

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const messages = getMessagesFromTelegram();
      if (!messages.length) {
        setSummary("Сообщения не найдены");
        return;
      }

      const generatedSummary = await getSummary(messages, apiKey);
      setSummary(generatedSummary);
    } catch (err) {
      console.error("Ошибка генерации резюме:", err);
      setError("Ошибка при генерации резюме");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Summary isLoading={isLoading} summary={summary} onGenerateSummary={handleGenerate} />
  );
};
