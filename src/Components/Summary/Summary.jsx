import React from "react";
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

export const Summary = () => {
  return (
    <Container>
      <SummaryTitle>Резюме</SummaryTitle>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </Text>
    </Container>
  );
};
