import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 48px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
  
  @media (max-width: 360px) {
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
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
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 16px;
    margin-right: 10px;
  }
  
  @media (max-width: 360px) {
    width: 24px;
    height: 24px;
    font-size: 14px;
    margin-right: 8px;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  color: #111827;
  min-width: 0;
  flex: 1;
`;

const TitleText = styled.h1`
  margin: 0;
  color: #111827 !important;
  font-size: 20px;
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
  
  @media (max-width: 360px) {
    font-size: 16px;
  }
`;

const ChatTitle = styled.p`
  margin: 2px 0 0 0;
  color: #6b7280 !important;
  font-size: 12px;
  font-weight: 400;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
  
  @media (max-width: 360px) {
    font-size: 10px;
  }
`;

export const Title = ({ chatTitle }) => {
  const { t } = useTranslation();
  
  return (
    <Header>
      <Logo>G</Logo>
      <TitleContainer>
        <TitleText>{t('appTitle')}</TitleText>
        {chatTitle && <ChatTitle>{chatTitle}</ChatTitle>}
      </TitleContainer>
    </Header>
  );
};
