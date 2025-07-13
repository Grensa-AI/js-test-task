import React from "react";
import styled, { keyframes } from "styled-components";

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
const ErrorText = styled(Text)`
  color: #dc2626;
`;
const SkeletonText = styled(Text)`
  color: #9ca3af;
  font-style: italic;
`;
const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const shimmer = keyframes`
  0% {background-position: -300px 0; }
  100% {background-position: 300px 0; }
`
const SkeletonContent = styled.div`
  height: 70px;
  border-radius: 4px;
  background: linear-gradient(
    to right,
    #e5e7eb 0%,
    #f3f4f6 20%,
    #e5e7eb 40%,
    #e5e7eb 100%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.2s infinite linear;
`

export const Summary = ({ text, loading, error }) => {
  return (
    <Container>
      <SummaryTitle>Резюме</SummaryTitle>

      {loading ? (
        <SkeletonWrapper>
          <SkeletonText>⏳ Summarizing...</SkeletonText>
          <SkeletonContent />
        </SkeletonWrapper>
      ) : error ? (
        <ErrorText>❌ {error}</ErrorText>
      ) : (
        <Text>{text || "Нет данных для отображения."}</Text>
      )}
    </Container>
  );
};
