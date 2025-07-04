import * as React from "react";
import styled from "styled-components";
import { SUMMARY_BUTTON_TEXT, SUMMARY_STATUS } from "../../constants/constants";


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
`;

const Text = styled.p`
  margin: 0 0 15px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;

const ErrorText = styled.p`
  margin: 0 0 12px 0;
  color: #ef4444;
  font-size: 14px;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #cbd5e1;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6366f1;
  font-size: 14px;
  margin-bottom: 12px;
`;

const Button = styled.button`
  background: #6366f1;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #4f46e5;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Summary = ({ status, summary, onGenerateSummary, error }) => {
  const renderContent = () => {
    if (status === SUMMARY_STATUS.LOADING) return <SpinnerWrapper>
      <Spinner />
      <span>Генерация...</span>
    </SpinnerWrapper>;
    if (status === SUMMARY_STATUS.ERROR) return <ErrorText>{error}</ErrorText>;
    return <Text>{summary}</Text>;
  };

  function getButtonText(status) {
    return SUMMARY_BUTTON_TEXT[status] ?? SUMMARY_BUTTON_TEXT.initial;
  }

  return (
    <Container>
      <SummaryTitle>Резюме</SummaryTitle>
      {renderContent()}
      <Button
        onClick={onGenerateSummary}
        disabled={status === SUMMARY_STATUS.LOADING}
      >
        {getButtonText(status)}
      </Button>
    </Container>
  );
};
