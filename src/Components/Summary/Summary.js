import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #6366f1 50%, transparent 100%);
  }
`;

const SummaryTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: -0.3px;
`;

const Text = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #6366f1;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  margin-top: 8px;
`;

const EmptyState = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  text-align: center;
  padding: 40px 20px;
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
`;

const EmptyIcon = styled.div`
  font-size: 32px;
  opacity: 0.5;
`;

const SettingsButton = styled.button`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  margin-left: auto;
  transition: all 0.2s ease;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const Summary = () => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);

  // Проверяем наличие API ключа при загрузке
  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const result = await chrome.storage.local.get(['openaiApiKey']);
      setHasApiKey(!!result.openaiApiKey);
    } catch (error) {
      console.error('Ошибка при проверке API ключа:', error);
    }
  };

  // Слушаем сообщения от content script
  useEffect(() => {
    const handleMessage = (message) => {
      if (message.type === 'SUMMARY_UPDATE') {
        setSummary(message.summary);
        setIsLoading(false);
        setError("");
      } else if (message.type === 'SUMMARY_LOADING') {
        setIsLoading(true);
        setError("");
      } else if (message.type === 'SUMMARY_ERROR') {
        setError(message.error);
        setIsLoading(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setError("");
    // Отправляем сообщение в content script для обновления
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url?.includes('web.telegram.org')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'refresh_summary' });
      }
    });
  };

  const openSettings = () => {
    // Открываем popup с настройками
    chrome.runtime.sendMessage({ action: 'open_settings' });
  };

  if (!hasApiKey) {
    return (
      <Container>
        <SummaryTitle>
          <span>Резюме</span>
          <SettingsButton onClick={openSettings}>
            Настроить API
          </SettingsButton>
        </SummaryTitle>
        <EmptyState>
          <EmptyIcon>🔑</EmptyIcon>
          <div>Для работы расширения необходим OpenAI API ключ</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
            Если platform.openai.com заблокирован, используйте VPN или альтернативные способы получения ключа
          </div>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <SummaryTitle>
        <span>Резюме</span>
        {isLoading && <LoadingSpinner />}
        <RefreshButton onClick={handleRefresh} disabled={isLoading}>
          Обновить
        </RefreshButton>
      </SummaryTitle>
      
      <ContentArea>
        {isLoading && (
          <EmptyState>
            <LoadingSpinner />
            <div>Анализируем чат...</div>
          </EmptyState>
        )}
        
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}
        
        {!isLoading && !error && !summary && (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <div>Откройте чат в Telegram Web для анализа</div>
          </EmptyState>
        )}
        
        {!isLoading && !error && summary && (
          <Text>{summary}</Text>
        )}
      </ContentArea>
    </Container>
  );
};
