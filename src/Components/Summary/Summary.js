import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useTranslation } from "react-i18next";
import { generateChatSummary } from "../../utils/openai";
import { 
  getCachedSummary, 
  cacheSummary, 
  clearChatSummaryCache, 
  clearAllSummaryCache,
  hasCachedSummary 
} from "../../utils/summaryCache";
import { ContextSelector } from "../ContextSelector/ContextSelector";

const Container = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
  min-height: 100px;
  color: #111827;
  
  @media (max-width: 480px) {
    padding: 12px;
  }
  
  @media (max-width: 360px) {
    padding: 8px;
  }
  
  &.debug {
    border-left-color: #f59e0b;
    background: #fef3c7;
  }
`;

const SummaryTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #111827 !important;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  
  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 10px;
  }
  
  @media (max-width: 360px) {
    font-size: 14px;
    margin-bottom: 8px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const MessageCount = styled.span`
  font-size: 12px;
  color: #6b7280 !important;
  font-weight: 400;
`;

const ProviderInfo = styled.span`
  font-size: 10px;
  color: #9ca3af !important;
  font-weight: 400;
  margin-left: 8px;
`;

const ContextInfo = styled.div`
  background: #e0e7ff;
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
  font-size: 11px;
  color: #3730a3;
`;

const DebugBadge = styled.span`
  background: #f59e0b;
  color: white !important;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  margin-left: 8px;
`;

const CacheIndicator = styled.span`
  background: #10b981;
  color: white !important;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  margin-left: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 6px;
  }
  
  @media (max-width: 360px) {
    gap: 4px;
    width: 100%;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? '#6366f1' : props.variant === 'context' ? '#8b5cf6' : 'white'};
  color: ${props => props.primary || props.variant === 'context' ? 'white' : '#6b7280'} !important;
  border: 1px solid ${props => props.primary ? '#6366f1' : props.variant === 'context' ? '#8b5cf6' : '#e5e7eb'};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  
  @media (max-width: 480px) {
    padding: 3px 6px;
    font-size: 10px;
  }
  
  @media (max-width: 360px) {
    padding: 2px 4px;
    font-size: 9px;
    flex: 1;
    min-width: 0;
  }
  
  &:hover {
    background: ${props => 
      props.primary ? '#5856f0' : 
      props.variant === 'context' ? '#7c3aed' : 
      '#f3f4f6'
    };
    border-color: ${props => 
      props.primary ? '#5856f0' : 
      props.variant === 'context' ? '#7c3aed' : 
      '#d1d5db'
    };
  }
  
  &:disabled {
    background: #9ca3af;
    color: white !important;
    border-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const Text = styled.div`
  color: #374151 !important;
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6b7280 !important;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  border: 2px solid #e5e7eb;
  border-top: 2px solid #6366f1;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: ${spin} 1s linear infinite;
  margin-right: 8px;
`;

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 12px;
  color: #dc2626 !important;
  font-size: 14px;
`;

const ErrorText = styled.div`
  margin-bottom: 8px;
`;

const RetryButton = styled.button`
  background: #dc2626;
  color: white !important;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #b91c1c;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6b7280 !important;
  font-style: italic;
  padding: 20px;
`;

export const Summary = ({ chatData, settings, onRefreshData }) => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastChatId, setLastChatId] = useState(null);
  const [showContextSelector, setShowContextSelector] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const isGenerating = useRef(false);

  // Load cached summary when chat changes
  useEffect(() => {
    const currentChatId = chatData?.chatId || chatData?.chatTitle;
    if (currentChatId && currentChatId !== lastChatId) {
      console.log('Chat changed, loading cached summary:', currentChatId);
      loadCachedSummary();
      setLastChatId(currentChatId);
    }
  }, [chatData?.chatId, chatData?.chatTitle, lastChatId]);

  // Clear summary when settings change
  useEffect(() => {
    if (settings && lastChatId && summary) {
      console.log('Settings changed, clearing current summary');
      setSummary(null);
      setError(null);
      loadCachedSummary();
    }
  }, [settings?.debugMode, settings?.apiKey, settings?.provider, settings?.model]);

  const loadCachedSummary = async () => {
    if (!chatData) {
      setSummary(null);
      setError(null);
      return;
    }

    if (!settings) {
      console.log('No settings available');
      setError(t('noApiKey'));
      return;
    }

    try {
      const cachedSummary = await getCachedSummary(chatData, settings);
      
      if (cachedSummary) {
        console.log('Using cached summary');
        setSummary(cachedSummary);
        setError(null);
      } else {
        console.log('No cached summary available');
        setSummary(null);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading cached summary:', err);
      setError(t('summaryError'));
      setSummary(null);
    }
  };

  const generateSummary = async (contextData = null) => {
    const dataToSummarize = contextData || chatData;
    
    console.log('generateSummary called', { 
      hasChat: !!dataToSummarize, 
      hasMessages: !!dataToSummarize?.messages?.length, 
      hasSettings: !!settings,
      isGenerating: isGenerating.current,
      contextProvided: !!contextData
    });

    if (!dataToSummarize || !dataToSummarize.messages || dataToSummarize.messages.length === 0) {
      console.log('No chat data or messages - clearing summary');
      setSummary(null);
      setError(null);
      return;
    }

    if (!settings) {
      console.log('No settings available');
      setError(t('noApiKey'));
      return;
    }

    // Prevent duplicate requests
    if (isGenerating.current) {
      console.log('Already generating summary - skipping');
      return;
    }

    console.log('Starting summary generation');
    setLoading(true);
    setError(null);
    isGenerating.current = true;

    try {
      const result = await generateChatSummary(dataToSummarize, settings);
      console.log('Summary generation result:', result);
      
      if (result.success) {
        setSummary(result);
        setError(null);
        
        // Cache the new summary (this will replace any existing summary for this chat)
        const contextInfo = dataToSummarize.contextInfo || null;
        await cacheSummary(chatData, settings, result, contextInfo);
        
        // Close context selector if it was open
        setShowContextSelector(false);
      } else {
        setError(result.error);
        setSummary(null);
      }
    } catch (err) {
      console.error('Error in generateSummary:', err);
      setError(t('summaryError'));
      setSummary(null);
    } finally {
      console.log('Summary generation completed');
      setLoading(false);
      isGenerating.current = false;
    }
  };

  const handleRetry = () => {
    generateSummary();
  };

  const handleRefresh = () => {
    console.log('Refresh button clicked - forcing summary regeneration');
    generateSummary();
  };

  const handleSelectContext = () => {
    setShowContextSelector(true);
  };

  const handleContextSelected = (contextData) => {
    console.log('Context selected:', contextData);
    generateSummary(contextData);
  };

  const handleCollectMore = (result) => {
    console.log('Message collection completed:', result);
    // Refresh data to show new messages
    if (onRefreshData) {
      onRefreshData();
    }
  };

  const handleClearCache = async () => {
    if (!chatData) return;
    
    setIsClearingCache(true);
    try {
      await clearChatSummaryCache(chatData);
      setSummary(null);
      setError(null);
      console.log('Chat cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      setError(t('cacheClearError'));
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleClearAllCache = async () => {
    setIsClearingCache(true);
    try {
      await clearAllSummaryCache();
      setSummary(null);
      setError(null);
      console.log('All cache cleared successfully');
    } catch (error) {
      console.error('Error clearing all cache:', error);
      setError(t('cacheClearError'));
    } finally {
      setIsClearingCache(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Container>
        <SummaryTitle>
          {t('summary')}
          {settings?.debugMode && <DebugBadge>{t('debug')}</DebugBadge>}
        </SummaryTitle>
        <LoadingContainer>
          <LoadingSpinner />
          {t('generating')}
        </LoadingContainer>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container>
        <SummaryTitle>
          {t('summary')}
          {settings?.debugMode && <DebugBadge>{t('debug')}</DebugBadge>}
        </SummaryTitle>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={handleRetry} disabled={loading}>
            {t('refresh')}
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  // Show empty state
  if (!chatData || !chatData.messages || chatData.messages.length === 0) {
    return (
      <Container>
        <SummaryTitle>
          {t('summary')}
          {settings?.debugMode && <DebugBadge>{t('debug')}</DebugBadge>}
        </SummaryTitle>
        <EmptyState>
          {settings?.debugMode 
            ? t('enableDebugMode')
            : t('noMessages')
          }
        </EmptyState>
      </Container>
    );
  }

  // Show context selector if open
  if (showContextSelector) {
    return (
      <ContextSelector
        chatData={chatData}
        onContextSelected={handleContextSelected}
        onCollectMore={handleCollectMore}
        isVisible={true}
        onClose={() => setShowContextSelector(false)}
      />
    );
  }

  // Show no cache state when chat has messages but no summary
  if (chatData && chatData.messages && chatData.messages.length > 0 && !summary && !loading && !error) {
    return (
      <Container>
        <SummaryTitle>
          {t('summary')}
          {settings?.debugMode && <DebugBadge>{t('debug')}</DebugBadge>}
          <ButtonGroup>
            <MessageCount>
              ({chatData.messages.length} {t('messages')})
            </MessageCount>
            <ActionButton variant="context" onClick={handleSelectContext}>
              {t('selectContext')}
            </ActionButton>
            <ActionButton primary onClick={handleRefresh} disabled={loading || isClearingCache}>
              {t('createSummary', { count: chatData.messages.length })}
            </ActionButton>
          </ButtonGroup>
        </SummaryTitle>
        <EmptyState>
          {t('noMessages')}
        </EmptyState>
      </Container>
    );
  }

  // Show summary
  if (summary) {
    return (
      <Container className={summary.debug ? 'debug' : ''}>
        <SummaryTitle>
          {t('summary')}
          {summary.debug && <DebugBadge>{t('debug')}</DebugBadge>}
          {summary.provider && <ProviderInfo>{t('via')} {summary.provider}</ProviderInfo>}
          {summary.cached && <CacheIndicator>{t('cached')}</CacheIndicator>}
          <ButtonGroup>
            <MessageCount>
              ({summary.messagesCount || chatData?.messages?.length} {t('messages')})
            </MessageCount>
            <ActionButton variant="context" onClick={handleSelectContext}>
              {t('changeContext')}
            </ActionButton>
            <ActionButton onClick={handleRefresh} disabled={loading || isClearingCache}>
              {t('refresh')}
            </ActionButton>
            <ActionButton onClick={handleClearCache} disabled={loading || isClearingCache}>
              {isClearingCache ? t('clearing') : t('clearCache')}
            </ActionButton>
          </ButtonGroup>
        </SummaryTitle>
        
        {summary.context && (
          <ContextInfo>
            {t('summaryFor', { count: summary.context.messageCount, total: summary.context.totalAvailable })}
            {summary.context.selectedAt && (
              <span> • {new Date(summary.context.selectedAt).toLocaleString()}</span>
            )}
          </ContextInfo>
        )}
        
        <Text>{summary.summary}</Text>
        
        {summary.cached && summary.cachedAt && (
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
            {t('loadedFromCache')}: {new Date(summary.cachedAt).toLocaleString()}
          </div>
        )}
      </Container>
    );
  }

  return null;
};
