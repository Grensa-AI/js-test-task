import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import i18nInstance from "./i18n";
import { Title } from "./Components/Title/Title";
import { Summary } from "./Components/Summary/Summary";
import { Settings } from "./Components/Settings/Settings";
import { History } from "./Components/History/History";
import { loadSettings, saveSettings } from "./utils/storage";

const AppContainer = styled.div`
  width: 100%;
  min-width: 320px;
  max-width: 420px;
  height: 600px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  overflow-y: auto;
  color: #111827 !important;
  box-sizing: border-box;
  
  /* Responsive padding */
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
  
  @media (max-width: 360px) {
    padding: 8px;
    min-width: 300px;
  }
  
  /* Ensure all text elements have dark color */
  * {
    color: inherit;
    box-sizing: border-box;
  }
  
  /* Override any potential white text */
  h1, h2, h3, h4, h5, h6, p, span, div, label, input, button {
    color: #111827;
  }
  
  /* Specific overrides for styled components */
  button {
    color: #6b7280;
  }
`;

const ButtonContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
  align-items: flex-end;
  
  @media (max-width: 480px) {
    top: 12px;
    right: 12px;
    gap: 6px;
  }
  
  @media (max-width: 360px) {
    top: 8px;
    right: 8px;
    gap: 4px;
  }
`;

const MainButtonRow = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 480px) {
    gap: 6px;
  }
  
  @media (max-width: 360px) {
    gap: 4px;
  }
`;

const LanguageButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ControlButton = styled.button`
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 8px;
  color: #6b7280 !important;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    padding: 4px 6px;
    font-size: 12px;
  }
  
  @media (max-width: 360px) {
    padding: 3px 5px;
    font-size: 11px;
  }
  
  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #374151 !important;
  }
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &.history {
    border-color: #8b5cf6;
    color: #8b5cf6 !important;
    
    &:hover {
      background: #faf5ff;
      border-color: #7c3aed;
      color: #7c3aed !important;
    }
  }
`;

const AppContent = styled.div`
  position: relative;
  color: #111827;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
  color: #6b7280 !important;
`;

const StatusBar = styled.div`
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 11px;
    gap: 6px;
  }
  
  @media (max-width: 360px) {
    padding: 4px 6px;
    font-size: 10px;
    gap: 4px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 8px;
  }
  
  @media (max-width: 360px) {
    gap: 6px;
  }
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  
  @media (max-width: 360px) {
    gap: 3px;
  }
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => 
    props.status === 'active' ? '#10b981' : 
    props.status === 'warning' ? '#f59e0b' : 
    '#6b7280'
  };
`;

export const App = ({ chatData, onRefreshData }) => {
  const { t } = useTranslation();
  
  
  
  const [settings, setSettings] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [appStats, setAppStats] = useState(null);

  // Load settings on component mount
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
        setSettingsLoaded(true);
      } catch (error) {
        setSettings({ apiKey: '', debugMode: false });
        setSettingsLoaded(true);
      }
    };

    initializeSettings();
  }, []);

  // Update app statistics when chat data changes
  useEffect(() => {
    if (chatData) {
      const stats = {
        chatTitle: chatData.chatTitle || 'Unknown Chat',
        messageCount: chatData.messages?.length || 0,
        cachedCount: chatData.cachedCount || 0,
        isLimited: chatData.isLimited || false,
        hasStats: !!chatData.stats,
        totalWords: chatData.stats?.totalWords || 0,
        dateRange: chatData.stats?.dateRange || null
      };
      setAppStats(stats);
    } else {
      setAppStats(null);
    }
  }, [chatData]);

  const handleSaveSettings = async (newSettings) => {
    try {
      await saveSettings(newSettings);
      setSettings(newSettings);
      
      // Auto-close settings after successful save
      setTimeout(() => {
        setShowSettings(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
    setShowHistory(false); // Close history when opening settings
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
    setShowSettings(false); // Close settings when opening history
  };

  const handleRefreshData = () => {
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const toggleLanguage = () => {
    try {
      const currentLang = i18nInstance.language || 'en';
      const newLang = currentLang === 'en' ? 'ru' : 'en';
      
      if (i18nInstance && typeof i18nInstance.changeLanguage === 'function') {
        i18nInstance.changeLanguage(newLang);
      } else {
        console.error('i18nInstance.changeLanguage is not available');
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Don't render until settings are loaded
  if (!settingsLoaded) {
    return (
      <AppContainer>
        <LoadingContainer>
          {t('loading')}
        </LoadingContainer>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppContent>
        <ButtonContainer>
          <MainButtonRow>
            <ControlButton onClick={handleToggleSettings}>
              {t('settings')}
            </ControlButton>
            <ControlButton className="history" onClick={handleToggleHistory}>
              {t('history')}
            </ControlButton>
          </MainButtonRow>
          <LanguageButtonRow>
            <ControlButton onClick={toggleLanguage}>
              {(i18nInstance.language || 'en') === 'en' ? '🇺🇸 EN' : '🇷🇺 RU'}
            </ControlButton>
          </LanguageButtonRow>
        </ButtonContainer>
        
        <Title chatTitle={chatData?.chatTitle} />
        
        {/* Status bar showing current state */}
        {appStats && (
          <StatusBar>
            <StatusInfo>
              <StatusItem>
                <StatusIndicator status={appStats.messageCount > 0 ? 'active' : 'warning'} />
                <span>{appStats.messageCount} {t('messages')}</span>
              </StatusItem>
              {appStats.cachedCount > 0 && (
                <StatusItem>
                  <StatusIndicator status="active" />
                  <span>{appStats.cachedCount} {t('cached')}</span>
                </StatusItem>
              )}
              {appStats.totalWords > 0 && (
                <StatusItem>
                  <span>{appStats.totalWords.toLocaleString()} {t('words')}</span>
                </StatusItem>
              )}
              {appStats.isLimited && (
                <StatusItem>
                  <StatusIndicator status="warning" />
                  <span>{t('limitedView')}</span>
                </StatusItem>
              )}
            </StatusInfo>
            {settings?.debugMode && (
              <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '500' }}>
                {t('debugMode')}
              </div>
            )}
          </StatusBar>
        )}
        
        <Settings 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSave={handleSaveSettings}
        />
        
        <History 
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
        
        <Summary 
          chatData={chatData} 
          settings={settings} 
          onRefreshData={handleRefreshData} 
        />
      </AppContent>
    </AppContainer>
  );
};
