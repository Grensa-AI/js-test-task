import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Summary } from "@src/Components/Summary/Summary";
import useHashChange from "@src/hooks/useHashChange";
import extractChat from "@src/utils/extractChat";

const CacheWarning = styled.div`
  font-size: 12px;
  color: #92400e;
  background-color: #fef3c7;
  padding: 6px 10px;
  border-radius: 6px;
  margin-top: 8px;
  display: inline-block;
`;
const RefreshButton = styled.button`
  padding: 6px 12px;
  font-size: 12px;
  background: #e5e7eb;
  color: #111827;
  border: none;
  border-radius: 6px;
  align-self: flex-start;
  cursor: pointer;
  &:hover {
    background: #d1d5db;
  }
`;

const MetaNote = styled.span`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

export const SummaryPage = () => {
  const [chatInfo, setChatInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryMetaData, setSummaryMetaData] = useState({ fromCache: false, lastUpdated: "" });
  const [error, setError] = useState(null);
  const hash = useHashChange();

  const fetchSummary = (forceRefresh = false) => {
    if (!chatInfo || Object.keys(chatInfo).length === 0) return;

    setLoading(true);
    setError(null);

    chrome.runtime.sendMessage({ action: "get_summary", chatInfo, forceRefresh }, (response) => {
      setLoading(false);

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
        setSummaryMetaData({
          lastUpdated: response.lastUpdated,
          fromCache: response.fromCache
        });
      }
    });
  };

  useEffect(() => {
    setLoading(false);
    setSummary("Extracting messages...");
    setError(null);
    extractChat().then((chatInfo) => setChatInfo(chatInfo));
  }, [hash]);

  useEffect(() => {
    fetchSummary(false);
  }, [chatInfo]);

  const showRetryButton = !!error;
  const showRefreshButton = !error && summaryMetaData.fromCache;

  return (
    <>
      <Summary text={summary} loading={loading} error={error} />

      {summaryMetaData.fromCache && !error && (
        <CacheWarning>
          This summary is from cache. It may be outdated.
        </CacheWarning>
      )}

      {(showRetryButton || showRefreshButton) && (
        <div style={{ marginTop: "12px" }}>
          <RefreshButton onClick={() => fetchSummary(true)}>
            {showRetryButton ? "Retry" : "Get new summary"}
          </RefreshButton>
        </div>
      )}

      {summaryMetaData.lastUpdated && !error && (
        <MetaNote>
          Last updated: {new Date(summaryMetaData.lastUpdated).toLocaleString()}
        </MetaNote>
      )}
    </>
  );
};
