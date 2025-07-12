import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Title } from "./Components/Title/Title";
import { Summary } from "./Components/Summary/Summary";
import { Settings } from "./Components/Settings/Settings";

const AppContainer = styled.div`
  width: 380px;
  min-height: 400px;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  overflow: hidden;
  color: #ffffff;
  position: relative;
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
`;

const SettingsButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 16px;
  backdrop-filter: blur(10px);
  z-index: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const App = () => {
  const [showSettings, setShowSettings] = useState(false);

  // Слушаем сообщения для открытия настроек
  useEffect(() => {
    const handleMessage = (message) => {
      if (message.action === 'open_settings') {
        setShowSettings(true);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <AppContainer>
      <ContentWrapper>
        {!showSettings && (
          <>
            <SettingsButton onClick={handleToggleSettings}>
              ⚙️
            </SettingsButton>
            <Title />
            <Summary />
          </>
        )}
        
        {showSettings && (
          <>
            <BackButton onClick={handleToggleSettings}>
              ← Назад
            </BackButton>
            <Settings />
          </>
        )}
      </ContentWrapper>
    </AppContainer>
  );
};
