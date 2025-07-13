import React, { useEffect, useState } from "react";
import { Title } from "../Components/Title/Title";
import { Summary } from "../Components/Summary/Summary";
import useHashChange from "../hooks/useHashChange";
import extractChat from "../utils/extractChat";

export const SummaryPage = () => {
  const [chatInfo, setChatInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const hash = useHashChange();

  useEffect(() => {
    setLoading(false);
    setSummary("Extracting messages...");
    setError(null);
    extractChat().then((chatInfo) => setChatInfo(chatInfo));
  }, [hash])

  useEffect(() => {
    if (!chatInfo || Object.keys(chatInfo).length === 0) return;

    setLoading(true);

    chrome.runtime.sendMessage({ action: "get_summary", chatInfo }, (response) => {
      setLoading(false)
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message);
        return;
      }
      if (response?.error) {
        setError(response.error);
        setSummary(null);
      } else {
        setError(null);
        setSummary(response.summary);
      }
    });
    console.log(chatInfo);
  }, [chatInfo])
  return (
    <>
      <Title />
      <Summary text={summary} loading={loading} error={error} />
    </>
  );
};
