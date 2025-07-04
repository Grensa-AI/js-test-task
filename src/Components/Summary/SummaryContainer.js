import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { getMessagesFromTelegram } from "../../utils/messagesParser";
import { Summary } from "./Summary";
import { getSummary } from "../../api/cohere";
import { ERROR_MESSAGES, SUMMARY_MESSAGES, SUMMARY_STATUS } from "../../constants/constants";
import { useTelegramChatWatcher } from "../../hooks/useTelegramChatWatcher";

export const mapErrorToMessage = (err) => {
  const message = err.message || "";

   if (message.includes("NetworkError") || message.includes("Failed to fetch")) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  if (err.code === 429) return ERROR_MESSAGES.RATE_LIMIT;
  if (err.code === 401) return ERROR_MESSAGES.API_KEY_MISSING;
  return ERROR_MESSAGES.DEFAULT;
};

export const SummaryContainer = () => {
  const [summary, setSummary] = useState(SUMMARY_MESSAGES.DEFAULT);
  const [status, setStatus] = useState(SUMMARY_STATUS.INITIAL)
  const [error, setError] = useState(null);

  const lastChatIdRef = useRef(window.location.hash);
  const apiKey = process.env.REACT_APP_COHERE_API_KEY;


   useTelegramChatWatcher(() => {
    setSummary(SUMMARY_MESSAGES.DEFAULT);
    setStatus(SUMMARY_STATUS.INITIAL);
    setError(null);
  });
  

  const handleGenerate = async () => {
    setStatus(SUMMARY_STATUS.LOADING);
    setError(null);

    try {
      const messages = getMessagesFromTelegram();
      if (!messages.length) {
        setError(ERROR_MESSAGES.NO_MESSAGES)
        setStatus(SUMMARY_STATUS.ERROR);
        return;
      }

      const generatedSummary = await getSummary(messages, apiKey);
      setSummary(generatedSummary);
      setStatus(SUMMARY_STATUS.SUCCESS);
    } catch (err) {
      setError(mapErrorToMessage(err));
      setStatus(SUMMARY_STATUS.ERROR);
    };
  }

  return (
    <Summary status={status} summary={summary} error={error} onGenerateSummary={handleGenerate} />
  );
}
