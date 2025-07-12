import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { generateChatSummary } from "../../utils/openai";
import { 
  getCachedSummary, 
  cacheSummary, 
  clearChatSummaryCache, 
  clearAllSummaryCache,
  hasChatChanged 
} from "../../utils/summaryCache";

const Container = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
  min-height: 100px;
  color: #111827;
  
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

const LimitedWarning = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 8px 12px;
  margin: 8px 0;
  font-size: 12px;
  color: #92400e !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const CollectButton = styled.button`
  background: #f59e0b;
  color: white !important;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background: #d97706;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
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

const Text = styled.p`
  margin: 0;
  color: #6b7280 !important;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  
  .debug & {
    color: #92400e !important;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  border: 2px solid #f3f4f6;
  border-top: 2px solid #6366f1;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  color: #111827;
`;

const LoadingText = styled.p`
  margin: 0;
  color: #6b7280 !important;
  font-size: 14px;
  text-align: center;
`;

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;
  color: #111827;
`;

const ErrorText = styled.p`
  margin: 0;
  color: #dc2626 !important;
  font-size: 14px;
`;

const RetryButton = styled.button`
  background: #6366f1;
  color: white !important;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 8px;
  
  &:hover {
    background: #5b56f0;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const RefreshButton = styled.button`
  background: transparent;
  color: #6366f1 !important;
  border: 1px solid #6366f1;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #6366f1;
    color: white !important;
  }
  
  &:disabled {
    background: #9ca3af;
    color: white !important;
    border-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const CacheButton = styled.button`
  background: transparent;
  color: #dc2626 !important;
  border: 1px solid #dc2626;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 4px;
  
  &:hover {
    background: #dc2626;
    color: white !important;
  }
  
  &:disabled {
    background: #9ca3af;
    color: white !important;
    border-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const CacheIndicator = styled.span`
  font-size: 10px;
  color: #059669 !important;
  background: #d1fae5;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: #6b7280 !important;
  font-size: 14px;
`;

const DebugInfo = styled.div`
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 12px;
  margin: 12px 0;
  font-size: 12px;
  color: #374151 !important;
`;

const DebugTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #111827 !important;
  font-size: 14px;
  font-weight: 600;
`;

const DebugItem = styled.div`
  margin: 4px 0;
  color: #374151 !important;
  
  strong {
    color: #111827 !important;
  }
`;

const DebugCode = styled.pre`
  background: #1f2937;
  color: #f9fafb;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  overflow-x: auto;
  margin: 8px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ToggleButton = styled.button`
  background: transparent;
  color: #6366f1;
  border: none;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin: 4px 0;
  
  &:hover {
    color: #5b56f0;
  }
`;

export const Summary = ({ chatData, settings, onRefreshData }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastChatTitle, setLastChatTitle] = useState(null);
  const [showDebugDetails, setShowDebugDetails] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const isGenerating = useRef(false);

  // Load cached summary when chat data changes (aggressive caching)
  useEffect(() => {
    if (chatData && chatData.chatTitle !== lastChatTitle) {
      console.log('Chat title changed, loading cached summary:', chatData.chatTitle);
      loadCachedSummaryOrGenerate();
      setLastChatTitle(chatData.chatTitle);
    }
  }, [chatData?.chatTitle, lastChatTitle]);

  // Only check for cache when message count changes, don't auto-regenerate
  useEffect(() => {
    if (chatData && chatData.messages && lastChatTitle === chatData.chatTitle) {
      console.log('Message count changed, checking cache:', chatData.messages.length);
      // Only load from cache, don't auto-generate
      loadCachedSummaryIfAvailable();
    }
  }, [chatData?.messages?.length, chatData?.chatTitle, lastChatTitle]);

  // Clear summary when settings change (cache will be invalidated by provider/model change)
  useEffect(() => {
    if (settings && lastChatTitle && summary) {
      console.log('Settings changed, clearing current summary');
      setSummary(null);
      setError(null);
      // Load from cache or show empty state
      loadCachedSummaryIfAvailable();
    }
  }, [settings?.debugMode, settings?.apiKey, settings?.provider, settings?.model]);

  // Load cached summary if available, otherwise generate new one
  const loadCachedSummaryOrGenerate = async () => {
    if (!chatData || !chatData.messages || chatData.messages.length === 0) {
      console.log('No chat data or messages - clearing summary');
      setSummary(null);
      setError(null);
      return;
    }

    if (!settings) {
      console.log('No settings available');
      setError('Настройки не загружены');
      return;
    }

    console.log('Loading cached summary or generating new one');
    setLoading(true);
    setError(null);

    try {
      // Try to get cached summary first
      const cachedSummary = await getCachedSummary(chatData, settings);
      
      if (cachedSummary) {
        console.log('Using cached summary');
        setSummary(cachedSummary);
        setError(null);
        setLoading(false);
        return;
      }

      // No cache available, generate new summary
      console.log('No cache available, generating new summary');
      await generateSummary();
    } catch (err) {
      console.error('Error loading cached summary:', err);
      setError('Произошла ошибка при загрузке резюме');
      setSummary(null);
      setLoading(false);
    }
  };

  // Load cached summary only (don't generate if not available)
  const loadCachedSummaryIfAvailable = async () => {
    if (!chatData || !chatData.messages || chatData.messages.length === 0) {
      setSummary(null);
      setError(null);
      return;
    }

    if (!settings) {
      return;
    }

    try {
      const cachedSummary = await getCachedSummary(chatData, settings);
      
      if (cachedSummary) {
        console.log('Using cached summary for updated chat');
        setSummary(cachedSummary);
        setError(null);
      } else {
        console.log('No cached summary available for updated chat');
        // Don't generate automatically - user needs to manually refresh
        setSummary(null);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading cached summary:', err);
    }
  };

  const generateSummary = async (forceGenerate = false) => {
    console.log('generateSummary called', { 
      hasChat: !!chatData, 
      hasMessages: !!chatData?.messages?.length, 
      hasSettings: !!settings,
      isGenerating: isGenerating.current,
      forceGenerate
    });

    if (!chatData || !chatData.messages || chatData.messages.length === 0) {
      console.log('No chat data or messages - clearing summary');
      setSummary(null);
      setError(null);
      return;
    }

    if (!settings) {
      console.log('No settings available');
      setError('Настройки не загружены');
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
      const result = await generateChatSummary(chatData, settings);
      console.log('Summary generation result:', result);
      
      if (result.success) {
        setSummary(result);
        setError(null);
        
        // Cache the new summary
        await cacheSummary(chatData, settings, result);
      } else {
        setError(result.error);
        setSummary(null);
      }
    } catch (err) {
      console.error('Error in generateSummary:', err);
      setError('Произошла неожиданная ошибка');
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
    // Force reset the generating flag to ensure refresh always works
    isGenerating.current = false;
    
    // First refresh the chat data if the callback is available
    if (onRefreshData) {
      console.log('Refreshing chat data...');
      onRefreshData();
    }
    
    // Small delay to ensure state is properly reset
    setTimeout(() => {
      generateSummary(true); // Force generate new summary
    }, 10);
  };

  const handleClearCache = async () => {
    console.log('Clear cache button clicked');
    setIsClearingCache(true);
    
    try {
      await clearChatSummaryCache(chatData);
      setSummary(null);
      setError(null);
      console.log('Cache cleared for current chat');
    } catch (error) {
      console.error('Error clearing cache:', error);
      setError('Ошибка при очистке кэша');
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleClearAllCache = async () => {
    console.log('Clear all cache button clicked');
    setIsClearingCache(true);
    
    try {
      await clearAllSummaryCache();
      setSummary(null);
      setError(null);
      console.log('All cache cleared');
    } catch (error) {
      console.error('Error clearing all cache:', error);
      setError('Ошибка при очистке всего кэша');
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleCollectMessages = async () => {
    console.log('Collect messages button clicked');
    setIsCollecting(true);
    
    try {
      // Call the content script function to collect more messages
      if (window.collectMoreMessages) {
        await window.collectMoreMessages();
      }
      
      // Refresh the data after collection
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Error collecting messages:', error);
    } finally {
      setIsCollecting(false);
    }
  };

  const renderDebugInfo = () => {
    if (!summary?.debug || !summary?.debugInfo) return null;
    
    const { debugInfo } = summary;
    
    return (
      <DebugInfo>
        <DebugTitle>Информация отладки</DebugTitle>
        <DebugItem><strong>Провайдер:</strong> {debugInfo.provider || 'Не указан'}</DebugItem>
        <DebugItem><strong>Модель:</strong> {debugInfo.model || 'Не указана'}</DebugItem>
        <DebugItem><strong>Base URL:</strong> {debugInfo.baseURL || 'Не указан'}</DebugItem>
        <DebugItem><strong>API Key:</strong> {debugInfo.apiKey || 'Не установлен'}</DebugItem>
        <DebugItem><strong>Сообщений:</strong> {debugInfo.messagesCount || 0}</DebugItem>
        <DebugItem><strong>Чат:</strong> {debugInfo.chatTitle || 'Неизвестный чат'}</DebugItem>
        
        <ToggleButton onClick={() => setShowDebugDetails(!showDebugDetails)}>
          {showDebugDetails ? 'Скрыть детали' : 'Показать детали'}
        </ToggleButton>
        
        {showDebugDetails && (
          <>
            <DebugTitle style={{ marginTop: '12px' }}>Промпт:</DebugTitle>
            <DebugCode>{debugInfo.prompt || 'Промпт не найден'}</DebugCode>
            
            <DebugTitle>API Payload:</DebugTitle>
            <DebugCode>{debugInfo.apiPayload ? JSON.stringify(debugInfo.apiPayload, null, 2) : 'Payload не найден'}</DebugCode>
          </>
        )}
      </DebugInfo>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <Container>
        <SummaryTitle>
          Резюме
          {settings?.debugMode && <DebugBadge>Отладка</DebugBadge>}
          {chatData?.messages && (
            <MessageCount>({chatData.messages.length} сообщений)</MessageCount>
          )}
        </SummaryTitle>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>
            {settings?.debugMode ? 'Подготовка отладочной информации...' : 'Генерация резюме...'}
          </LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container>
        <SummaryTitle>
          Резюме
          {settings?.debugMode && <DebugBadge>Отладка</DebugBadge>}
          {chatData?.messages && (
            <MessageCount>({chatData.messages.length} сообщений)</MessageCount>
          )}
        </SummaryTitle>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={handleRetry} disabled={loading}>
            Повторить
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
          Резюме
          {settings?.debugMode && <DebugBadge>Отладка</DebugBadge>}
        </SummaryTitle>
        <EmptyState>
          {settings?.debugMode 
            ? 'Режим отладки включен. Выберите чат для просмотра отладочной информации.'
            : 'Выберите чат в Telegram для генерации резюме'
          }
        </EmptyState>
      </Container>
    );
  }

  // Show no cache state when chat has messages but no summary
  if (chatData && chatData.messages && chatData.messages.length > 0 && !summary && !loading && !error) {
    return (
      <Container>
        <SummaryTitle>
          Резюме
          {settings?.debugMode && <DebugBadge>Отладка</DebugBadge>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCount>
              ({chatData.messages.length} сообщений)
            </MessageCount>
            <RefreshButton onClick={handleRefresh} disabled={loading || isClearingCache}>
              Создать резюме
            </RefreshButton>
            <CacheButton onClick={handleClearAllCache} disabled={loading || isClearingCache}>
              {isClearingCache ? 'Очистка...' : 'Очистить весь кэш'}
            </CacheButton>
          </div>
        </SummaryTitle>
        <EmptyState>
          {settings?.debugMode 
            ? 'Нет кэшированного резюме. Нажмите "Создать резюме" для генерации.'
            : 'Нет кэшированного резюме. Нажмите "Создать резюме" для генерации с помощью ИИ.'
          }
        </EmptyState>
      </Container>
    );
  }

  // Show summary
  if (summary) {
    return (
      <Container className={summary.debug ? 'debug' : ''}>
        <SummaryTitle>
          Резюме
          {summary.debug && <DebugBadge>Отладка</DebugBadge>}
          {summary.provider && <ProviderInfo>via {summary.provider}</ProviderInfo>}
          {summary.cached && <CacheIndicator>Кэш</CacheIndicator>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCount>
              ({summary.messagesCount} сообщений
              {chatData?.cachedCount && chatData.cachedCount > 0 && (
                <span style={{ color: '#f59e0b' }}>
                  , {chatData.cachedCount} кэшированных
                </span>
              )}
              )
            </MessageCount>
            <RefreshButton onClick={handleRefresh} disabled={loading || isClearingCache}>
              Обновить
            </RefreshButton>
            <CacheButton onClick={handleClearCache} disabled={loading || isClearingCache}>
              {isClearingCache ? 'Очистка...' : 'Очистить кэш'}
            </CacheButton>
          </div>
        </SummaryTitle>
        
        <Text>{summary.summary}</Text>
        
        {summary.cached && summary.cachedAt && (
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
            Загружено из кэша: {new Date(summary.cachedAt).toLocaleString('ru-RU')}
          </div>
        )}
        
        {chatData?.isLimited && (
          <LimitedWarning>
            <span>⚠️ Показаны только видимые сообщения из-за виртуальной прокрутки Telegram</span>
            <CollectButton 
              onClick={handleCollectMessages} 
              disabled={isCollecting}
            >
              {isCollecting ? 'Сбор...' : 'Собрать больше'}
            </CollectButton>
          </LimitedWarning>
        )}
        
        {renderDebugInfo()}
      </Container>
    );
  }

  // Default state
  return (
    <Container>
      <SummaryTitle>
        Резюме
        {settings?.debugMode && <DebugBadge>Отладка</DebugBadge>}
      </SummaryTitle>
      <Text>
        {settings?.debugMode
          ? 'Режим отладки включен. Нажмите на значок расширения для просмотра отладочной информации.'
          : 'Нажмите на значок расширения, чтобы сгенерировать резюме текущего чата.'
        }
      </Text>
    </Container>
  );
};
