import * as React from "react";
import styled from "styled-components";


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
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;


const Button = styled.button`
  background: #6366f1;
  color: white;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #4f46e5;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Summary = ({ isLoading, summary, onGenerateSummary }) => {
  
  return (
    <Container>
      <SummaryTitle>Резюме</SummaryTitle>
      <Text>
        {isLoading ? "🔄 Генерация резюме..." : summary}
      </Text>
      <Button onClick={onGenerateSummary}>Сгенерировать резюме</Button>
    </Container>
  );
};
