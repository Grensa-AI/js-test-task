import React, { useEffect } from "react";
import styled from "styled-components";
import { Title } from "./Components/Title/Title";
import { Summary } from "./Components/Summary/Summary";
import { useSummary } from "./hooks/useSummary";

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
  const { summary, isLoading, error, isConfigured, generateSummary } =
    useSummary();

  useEffect(() => {
    const handleMessage = (request) => {
      if (request.action === "toggle") {
        generateSummary();
      }
    };

    if (window.chrome && chrome.runtime) {
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }
  }, [generateSummary]);

  return (
    <AppContainer>
      <Title />
      <Summary
        summary={summary}
        isLoading={isLoading}
        error={error}
        onRefresh={generateSummary}
        isConfigured={isConfigured}
      />
    </AppContainer>
  );
};
