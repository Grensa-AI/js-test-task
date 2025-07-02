import React from "react";
import styled from "styled-components";
import { Spinner, Button, ErrorMessage } from "../UI";

const Container = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Text = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;

const RefreshButton = styled(Button)`
  margin-top: 8px;
`;

export const Summary = ({ summary, isLoading, error, onRefresh }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <SummaryTitle>
            Resume generation
            <Spinner />
          </SummaryTitle>
          <Text>Analyzing chat messages...</Text>
        </>
      );
    }

    if (error) {
      return (
        <>
          <SummaryTitle>Error</SummaryTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <RefreshButton onClick={onRefresh}>Try again</RefreshButton>
        </>
      );
    }

    if (summary) {
      return (
        <>
          <SummaryTitle>Chat Summary</SummaryTitle>
          <Text>{summary}</Text>
          <RefreshButton onClick={onRefresh}>Update Summary</RefreshButton>
        </>
      );
    }

    return (
      <>
        <SummaryTitle>Chat Summary</SummaryTitle>
        <Text>
          Open a chat in Telegram Web and click on the extension icon to
          generate a resume.
        </Text>
        <RefreshButton onClick={onRefresh}>Create Summary</RefreshButton>
      </>
    );
  };

  return <Container>{renderContent()}</Container>;
};
