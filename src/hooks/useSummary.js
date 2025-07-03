import { useState, useRef } from "react";
import { parseMessages } from "../utils/telegramParser";
import { generateSummary, isConfigured } from "../services/openaiService";
import { createMessagesHash } from "../utils/createMessageHash";

export const useSummary = () => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcriptionInfo, setTranscriptionInfo] = useState(null);

  const cacheRef = useRef(new Map());
  const isProcessingRef = useRef(false);

  const handleGenerateSummary = async () => {
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    setIsLoading(true);
    setError(null);
    setTranscriptionInfo(null);

    try {
      if (!isConfigured()) {
        throw new Error("OpenAI API ключ не настроен.");
      }

      const result = await parseMessages();
      const messages = result.messages;
      const transcriptionStatus = result.transcriptionStatus;
      const currentHash = createMessagesHash(messages);

      console.log("=== ОТЛАДКА КЕШИРОВАНИЯ ===");
      console.log(
        "1. Сообщения (первые 100 символов):",
        JSON.stringify(messages).slice(0, 100)
      );
      console.log("2. Хеш:", currentHash);
      console.log("3. Содержит этот хеш?", cacheRef.current.has(currentHash));
      console.log("4. Все хеши в кеше:", Array.from(cacheRef.current.keys()));
      console.log("5. TranscriptionStatus:", transcriptionStatus);

      if (cacheRef.current.has(currentHash)) {
        console.log("ИСПОЛЬЗУЕМ КЕШ");

        const cachedData = cacheRef.current.get(currentHash);
        setSummary(cachedData.summary);
        setTranscriptionInfo(cachedData.transcriptionStatus);

        return;
      } else {
        console.log("НОВЫЙ API ЗАПРОС");
      }

      const summaryText = await generateSummary(messages);

      cacheRef.current.set(currentHash, {
        summary: summaryText,
        transcriptionStatus,
      });

      if (cacheRef.current.size > 5) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      setSummary(summaryText);
      setTranscriptionInfo(transcriptionStatus);
    } catch (err) {
      setError(err.message);
      setSummary("");
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  };

  return {
    summary,
    isLoading,
    error,
    transcriptionInfo,
    isConfigured: isConfigured(),
    generateSummary: handleGenerateSummary,
  };
};
