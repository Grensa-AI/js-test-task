import { useState, useRef } from "react";
import { parseMessages } from "../utils/telegramParser";
import { generateSummary, isConfigured } from "../services/openaiService";
import { createMessagesHash } from "../utils/createMessageHash";

export const useSummary = () => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcriptionInfo, setTranscriptionInfo] = useState(null);
  const [messagesInfo, setMessagesInfo] = useState([]);

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
      setMessagesInfo(messages);

      if (cacheRef.current.has(currentHash)) {
        const cachedData = cacheRef.current.get(currentHash);
        setSummary(cachedData.summary);
        setTranscriptionInfo(cachedData.transcriptionStatus);

        return;
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
      setMessagesInfo([]);
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
    messagesInfo,
    isConfigured: isConfigured(),
    generateSummary: handleGenerateSummary,
  };
};
