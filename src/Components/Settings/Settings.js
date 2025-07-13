import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { PROVIDERS } from "../../utils/openai";
import { getCacheStats, clearAllSummaryCache } from "../../utils/summaryCache";

const SettingsContainer = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
  color: #111827;
  
  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 360px) {
    padding: 8px;
    margin-bottom: 8px;
  }
`;

const SettingsTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #111827 !important;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 360px) {
    font-size: 14px;
    margin-bottom: 8px;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #6b7280 !important;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #e5e7eb;
    color: #111827 !important;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  color: #111827;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  color: #374151 !important;
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  background-color: white;
  color: #111827 !important;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af !important;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  background-color: white;
  color: #111827 !important;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  option {
    color: #111827 !important;
    background-color: white;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #111827;
  
  &:hover {
    background-color: #f9fafb;
    border-radius: 4px;
    padding: 8px;
    margin: 0 -8px;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #6366f1;
  transform: scale(1.2);
  margin: 0;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  background-color: #ffffff;
  position: relative;
  
  /* Ensure checkbox is visible */
  -webkit-appearance: checkbox;
  -moz-appearance: checkbox;
  appearance: checkbox;
  
  /* Fallback for browsers that don't support accent-color */
  &:checked {
    background-color: #6366f1;
    border-color: #6366f1;
  }
  
  &:focus {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
  
  &:hover {
    border-color: #6366f1;
  }
`;

const CheckboxLabel = styled.label`
  color: #374151 !important;
  font-size: 14px;
  cursor: pointer;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 6px;
    margin-top: 12px;
  }
  
  @media (max-width: 360px) {
    gap: 4px;
    margin-top: 8px;
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  @media (max-width: 360px) {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SaveButton = styled(Button)`
  background: #6366f1;
  color: white !important;
  
  &:hover:not(:disabled) {
    background: #5b56f0;
  }
`;

const ClearButton = styled(Button)`
  background: #ef4444;
  color: white !important;
  
  &:hover:not(:disabled) {
    background: #dc2626;
  }
`;

const HelpText = styled.p`
  margin: 8px 0 0 0;
  color: #6b7280 !important;
  font-size: 12px;
  line-height: 1.4;
`;

const StatusMessage = styled.div`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 12px;
  
  &.success {
    background: #dcfce7;
    color: #166534 !important;
    border: 1px solid #bbf7d0;
  }
  
  &.error {
    background: #fef2f2;
    color: #dc2626 !important;
    border: 1px solid #fecaca;
  }
`;

const CacheSection = styled.div`
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
  margin-top: 16px;
  color: #111827;
`;

const CacheStats = styled.div`
  background: #f3f4f6;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #374151 !important;
`;

const CacheStatsItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  color: #374151 !important;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  strong {
    color: #111827 !important;
  }
`;

const CacheButton = styled(Button)`
  background: #f59e0b;
  color: white !important;
  
  &:hover:not(:disabled) {
    background: #d97706;
  }
`;

const ToggleWrapper = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: #374151 !important;
  font-size: 14px;
  &:hover {
    background-color: #f9fafb;
  }
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 40px;
  min-width: 40px;
  height: 20px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  position: absolute;
  &:focus + span {
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.checked ? '#6366f1' : '#d1d5db'};
  border-radius: 34px;
  transition: background 0.3s;
  &:before {
    content: '';
    position: absolute;
    left: ${props => props.checked ? '20px' : '2px'};
    top: 2px;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: left 0.3s;
  }
`;

export const Settings = ({ isOpen, onClose, settings, onSave }) => {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [debugMode, setDebugMode] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.apiKey || '');
      setProvider(settings.provider || 'openai');
      setDebugMode(settings.debugMode || false);
      console.log('Settings loaded:', settings);
    }
  }, [settings]);

  // Load cache stats when settings open
  useEffect(() => {
    if (isOpen) {
      loadCacheStats();
    }
  }, [isOpen]);

  const loadCacheStats = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus(null);
    
    try {
      const newSettings = {
        apiKey: apiKey.trim(),
        provider: provider,
        debugMode: debugMode
      };
      
      await onSave(newSettings);
      setStatus({ type: 'success', message: t('settingsSaved') });
    } catch (error) {
      setStatus({ type: 'error', message: t('settingsError') });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    setProvider('openai');
    setDebugMode(false);
    setStatus(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const handleClearAllCache = async () => {
    setClearingCache(true);
    setStatus(null);
    
    try {
      await clearAllSummaryCache();
      await loadCacheStats(); // Reload stats
      setStatus({ type: 'success', message: t('cacheCleared') });
    } catch (error) {
      setStatus({ type: 'error', message: t('cacheClearError') });
    } finally {
      setClearingCache(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return `0 ${t('bytes')}`;
    const k = 1024;
    const sizes = [t('bytes'), t('kb'), t('mb')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  const currentProvider = PROVIDERS[provider];

  return (
    <SettingsContainer>
      <SettingsTitle>
        {t('settingsTitle')}
        <CloseButton onClick={onClose}>×</CloseButton>
      </SettingsTitle>
      
      {status && (
        <StatusMessage className={status.type}>
          {status.message}
        </StatusMessage>
      )}
      
      <FormGroup>
        <Label htmlFor="provider">{t('aiProvider')}</Label>
        <Select
          id="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          {Object.entries(PROVIDERS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name}
            </option>
          ))}
        </Select>
        <HelpText>
          {t('selectProvider')}
        </HelpText>
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="apiKey">{currentProvider.name} {t('apiKey')}</Label>
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={currentProvider.keyPrefix + "..."}
          autoComplete="off"
        />
        <HelpText>
          {t('getApiKey')}{' '}
          <a 
            href={currentProvider.helpUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#6366f1' }}
          >
            {currentProvider.helpUrl.replace('https://', '')}
          </a>
        </HelpText>
      </FormGroup>

      <FormGroup>
        <ToggleWrapper htmlFor="debugMode">
          {t('debugModeLabel')}
          <ToggleSwitch>
            <ToggleInput
              id="debugMode"
              type="checkbox"
              checked={debugMode}
              onChange={(e) => {
                console.log('Debug mode changed:', e.target.checked);
                setDebugMode(e.target.checked);
              }}
            />
            <ToggleSlider checked={debugMode} />
          </ToggleSwitch>
        </ToggleWrapper>
        <HelpText>
          {t('enableDebugMode')}
        </HelpText>
      </FormGroup>

      <ButtonGroup>
        <SaveButton 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? t('settingsSaved') : t('saveSettings')}
        </SaveButton>
        <ClearButton 
          onClick={handleClear}
          disabled={loading}
        >
          {t('clearSettings')}
        </ClearButton>
      </ButtonGroup>

      <CacheSection>
        <Label>{t('cacheStatistics')}</Label>
        <HelpText style={{ marginBottom: '12px' }}>
          {t('cacheStatistics')}
        </HelpText>
        
        {cacheStats && (
          <CacheStats>
            <CacheStatsItem>
              <span>{t('totalEntries')}:</span>
              <strong>{cacheStats.totalEntries}</strong>
            </CacheStatsItem>
            <CacheStatsItem>
              <span>{t('totalSize')}:</span>
              <strong>{formatBytes(cacheStats.totalSize)}</strong>
            </CacheStatsItem>
            {cacheStats.entries.length > 0 && (
              <CacheStatsItem>
                <span>{t('lastSummary')}:</span>
                <strong>{cacheStats.entries[0].chatTitle}</strong>
              </CacheStatsItem>
            )}
          </CacheStats>
        )}
        
        <ButtonGroup>
          <CacheButton 
            onClick={handleClearAllCache} 
            disabled={clearingCache || loading}
          >
            {clearingCache ? t('clearingCache') : t('clearCache')}
          </CacheButton>
        </ButtonGroup>
      </CacheSection>
    </SettingsContainer>
  );
}; 