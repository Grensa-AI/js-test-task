import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Title } from "./Components/Title/Title";
import { Summary } from "./Components/Summary/Summary";
import useHashChange from "./hooks/useHashChange";
import extractChat from "./utils/extractChat";

const AppContainer = styled.div`
  width: 400px;
  height: auto;
  max-height: 500px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  overflow-y: auto;
  color: #111827;
`;

export const App = () => {
  const [chatInfo, setChatInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const hash = useHashChange();

  useEffect(() => {
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
    <AppContainer>
      <Title />
      <Summary text={summary} loading={loading} error={error} />
    </AppContainer>
  );
};
