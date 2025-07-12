import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Title } from "./Components/Title/Title";
import { Summary } from "./Components/Summary/Summary";
import { Settings } from "./Components/Settings/Settings";
import { History } from "./Components/History/History";
import { loadSettings, saveSettings } from "./utils/storage";

const AppContainer = styled.div`
  width: 400px;
  height: auto;
  max-height: 500px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  overflow-y: auto;
  color: #111827 !important;
  
  /* Ensure all text elements have dark color */
  * {
    color: inherit;
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
  gap: 8px;
  z-index: 1000;
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

export const App = ({ chatData, onRefreshData }) => {
  const [settings, setSettings] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
        setSettingsLoaded(true);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettings({ apiKey: '', debugMode: false });
        setSettingsLoaded(true);
      }
    };

    initializeSettings();
  }, []);

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

  // Don't render until settings are loaded
  if (!settingsLoaded) {
    return (
      <AppContainer>
        <LoadingContainer>
          Загрузка...
        </LoadingContainer>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <AppContent>
        <ButtonContainer>
          <ControlButton onClick={handleToggleSettings}>
            ⚙️ Настройки
          </ControlButton>
          <ControlButton className="history" onClick={handleToggleHistory}>
            📚 История
          </ControlButton>
        </ButtonContainer>
        
        <Title chatTitle={chatData?.chatTitle} />
        
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
        
        <Summary chatData={chatData} settings={settings} onRefreshData={onRefreshData} />
      </AppContent>
    </AppContainer>
  );
};
