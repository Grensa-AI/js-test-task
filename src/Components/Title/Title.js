import React from "react";
import styled from "styled-components";

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
`;

const Logo = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-weight: bold;
  color: white !important;
  font-size: 18px;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  color: #111827;
`;

const TitleText = styled.h1`
  margin: 0;
  color: #111827 !important;
  font-size: 20px;
  font-weight: 600;
`;

const ChatTitle = styled.p`
  margin: 2px 0 0 0;
  color: #6b7280 !important;
  font-size: 12px;
  font-weight: 400;
  opacity: 0.8;
`;

export const Title = ({ chatTitle }) => {
  return (
    <Header>
      <Logo>G</Logo>
      <TitleContainer>
        <TitleText>Grensa.AI</TitleText>
        {chatTitle && <ChatTitle>{chatTitle}</ChatTitle>}
      </TitleContainer>
    </Header>
  );
};
