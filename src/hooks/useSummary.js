import { useState } from "react";
import { parseMessages } from "../utils/telegramParser";
import { generateSummary, isConfigured } from "../services/openaiService";

export const useSummary = () => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcriptionInfo, setTranscriptionInfo] = useState(null);

  const handleGenerateSummary = async () => {
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

      const summaryText = await generateSummary(messages);

      setSummary(summaryText);
      setTranscriptionInfo(transcriptionStatus);
    } catch (err) {
      setError(err.message);
      setSummary("");
    } finally {
      setIsLoading(false);
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
