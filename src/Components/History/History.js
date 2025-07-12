import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  getSummaryHistory, 
  getHistoryStats, 
  deleteHistoryEntry, 
  clearAllHistory 
} from "../../utils/summaryHistory";

const Container = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #8b5cf6;
  min-height: 100px;
  color: #111827;
  max-height: 500px;
  overflow-y: auto;
  
  @media (max-width: 480px) {
    padding: 12px;
    max-height: 400px;
  }
  
  @media (max-width: 360px) {
    padding: 8px;
    max-height: 300px;
  }
`;

const HistoryTitle = styled.h3`
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

const StatsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #6b7280;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 360px) {
    gap: 4px;
    margin-bottom: 8px;
    flex-direction: column;
  }
`;

const FilterSelect = styled.select`
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  color: #374151;
`;

const FilterInput = styled.input`
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  color: #374151;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HistoryEntry = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  position: relative;
  
  &.debug {
    border-left: 3px solid #f59e0b;
    background: #fefbf3;
  }
`;

const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const EntryTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827 !important;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    font-size: 13px;
    max-width: 150px;
  }
  
  @media (max-width: 360px) {
    font-size: 12px;
    max-width: 120px;
  }
`;

const EntryMeta = styled.div`
  font-size: 11px;
  color: #6b7280 !important;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const EntryContent = styled.div`
  font-size: 13px;
  color: #374151 !important;
  line-height: 1.4;
  margin-bottom: 8px;
  max-height: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContextSection = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 11px;
  color: #6b7280 !important;
`;

const ContextRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ContextLabel = styled.span`
  font-weight: 500;
`;

const ContextValue = styled.span`
  color: #374151 !important;
`;

const MessagePreview = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 4px;
  font-size: 10px;
  color: #6b7280 !important;
`;

const MessageItem = styled.div`
  margin-bottom: 4px;
  padding: 2px 0;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const MessageDirection = styled.span`
  font-weight: 500;
  color: ${props => props.direction === 'incoming' ? '#059669' : '#dc2626'} !important;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  
  &.delete {
    background: #fef2f2;
    color: #dc2626 !important;
    border: 1px solid #fecaca;
    
    &:hover {
      background: #fee2e2;
    }
  }
  
  &.expand {
    background: #f0f9ff;
    color: #0369a1 !important;
    border: 1px solid #bae6fd;
    
    &:hover {
      background: #e0f2fe;
    }
  }
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ControlButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &.refresh {
    background: #f0f9ff;
    color: #0369a1 !important;
    border: 1px solid #bae6fd;
    
    &:hover {
      background: #e0f2fe;
    }
  }
  
  &.clear {
    background: #fef2f2;
    color: #dc2626 !important;
    border: 1px solid #fecaca;
    
    &:hover {
      background: #fee2e2;
    }
  }
  
  &:disabled {
    background: #f3f4f6;
    color: #9ca3af !important;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6b7280 !important;
  font-size: 14px;
  padding: 32px 16px;
`;

const LoadingSpinner = styled.div`
  border: 2px solid #e5e7eb;
  border-top: 2px solid #8b5cf6;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const History = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [filters, setFilters] = useState({
    chatId: '',
    provider: '',
    limit: 20
  });

  // Load history when component opens or filters change
  useEffect(() => {
    if (isOpen) {
      loadHistory();
      loadStats();
    }
  }, [isOpen, filters]);

  // Listen for history updates via custom events
  useEffect(() => {
    const handleHistoryUpdate = async (event) => {
      console.log('History update event received:', event.detail);
      if (isOpen) {
        setRefreshing(true);
        try {
          await loadHistory();
          await loadStats();
        } finally {
          setRefreshing(false);
        }
      }
      setLastUpdateTime(Date.now());
    };

    window.addEventListener('summaryHistoryUpdated', handleHistoryUpdate);
    return () => window.removeEventListener('summaryHistoryUpdated', handleHistoryUpdate);
  }, [isOpen]);

  // Fallback polling mechanism for edge cases
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(async () => {
      try {
        // Check if there are new history entries by comparing timestamps
        const { history: currentHistory } = await getSummaryHistory({ limit: 1 });
        if (currentHistory.length > 0) {
          const latestTimestamp = new Date(currentHistory[0].timestamp).getTime();
          if (latestTimestamp > lastUpdateTime) {
            console.log('New history entries detected via polling, refreshing...');
            await loadHistory();
            await loadStats();
            setLastUpdateTime(Date.now());
          }
        }
      } catch (error) {
        console.error('Error checking for history updates:', error);
      }
    }, 5000); // Check every 5 seconds (less frequent since we have events)

    return () => clearInterval(interval);
  }, [isOpen, lastUpdateTime]);

  // Update last update time when history loads
  useEffect(() => {
    if (history.length > 0) {
      const latestTimestamp = new Date(history[0].timestamp).getTime();
      setLastUpdateTime(Math.max(latestTimestamp, lastUpdateTime));
    }
  }, [history]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const historyData = await getSummaryHistory(filters);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getHistoryStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Удалить эту запись из истории?')) return;
    
    try {
      await deleteHistoryEntry(entryId);
      await loadHistory();
      await loadStats();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Очистить всю историю? Это действие нельзя отменить.')) return;
    
    try {
      await clearAllHistory();
      await loadHistory();
      await loadStats();
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const toggleExpanded = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueChats = () => {
    const chats = new Set();
    history.forEach(entry => {
      if (entry.chatTitle) {
        chats.add(entry.chatTitle);
      }
    });
    return Array.from(chats);
  };

  const getUniqueProviders = () => {
    const providers = new Set();
    history.forEach(entry => {
      if (entry.provider) {
        providers.add(entry.provider);
      }
    });
    return Array.from(providers);
  };

  if (!isOpen) return null;

  return (
    <Container>
      <HistoryTitle>
        История резюме {refreshing && <span style={{ color: '#8b5cf6', fontSize: '12px' }}>🔄</span>}
        <ControlButtons>
          <ControlButton 
            className="refresh" 
            onClick={loadHistory}
            disabled={loading || refreshing}
          >
            {loading ? 'Загрузка...' : refreshing ? 'Обновление...' : 'Обновить'}
          </ControlButton>
          <ControlButton 
            className="clear" 
            onClick={handleClearAll}
            disabled={loading || history.length === 0}
          >
            Очистить всё
          </ControlButton>
          <ControlButton onClick={onClose}>
            Закрыть
          </ControlButton>
        </ControlButtons>
      </HistoryTitle>

      {stats && (
        <StatsContainer>
          <StatItem>
            <span>📊</span>
            <span>Всего записей: {stats.totalEntries}</span>
          </StatItem>
          <StatItem>
            <span>💬</span>
            <span>Чатов: {stats.uniqueChats}</span>
          </StatItem>
          {Object.keys(stats.providers).length > 0 && (
            <StatItem>
              <span>🤖</span>
              <span>Провайдеры: {Object.keys(stats.providers).join(', ')}</span>
            </StatItem>
          )}
        </StatsContainer>
      )}

      <FilterContainer>
        <FilterSelect
          value={filters.chatId}
          onChange={(e) => setFilters({...filters, chatId: e.target.value})}
        >
          <option value="">Все чаты</option>
          {getUniqueChats().map(chat => (
            <option key={chat} value={chat}>{chat}</option>
          ))}
        </FilterSelect>
        
        <FilterSelect
          value={filters.provider}
          onChange={(e) => setFilters({...filters, provider: e.target.value})}
        >
          <option value="">Все провайдеры</option>
          {getUniqueProviders().map(provider => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </FilterSelect>
        
        <FilterInput
          type="number"
          placeholder="Лимит"
          value={filters.limit}
          onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value) || 20})}
          min="1"
          max="100"
        />
      </FilterContainer>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <LoadingSpinner />
        </div>
      ) : history.length === 0 ? (
        <EmptyState>
          История пуста. Создайте резюме для чата, чтобы увидеть записи здесь.
        </EmptyState>
      ) : (
        <HistoryList>
          {history.map(entry => (
            <HistoryEntry key={entry.id} className={entry.debug ? 'debug' : ''}>
              <EntryHeader>
                <EntryTitle title={entry.chatTitle}>
                  {entry.chatTitle}
                </EntryTitle>
                <EntryMeta>
                  <div>{formatDate(entry.timestamp)}</div>
                  <div>{entry.provider} • {entry.model}</div>
                  {entry.debug && <div style={{ color: '#f59e0b' }}>DEBUG</div>}
                  {entry.cached && <div style={{ color: '#059669' }}>CACHE</div>}
                </EntryMeta>
              </EntryHeader>
              
              <EntryContent>
                {entry.summary}
              </EntryContent>
              
              <ContextSection>
                <ContextRow>
                  <ContextLabel>Сообщений:</ContextLabel>
                  <ContextValue>{entry.context?.messageCount || 0}</ContextValue>
                </ContextRow>
                <ContextRow>
                  <ContextLabel>Настройки:</ContextLabel>
                  <ContextValue>
                    {entry.context?.settings?.provider} • {entry.context?.settings?.model}
                  </ContextValue>
                </ContextRow>
                
                {expandedEntries.has(entry.id) && entry.context?.messagesPreview && (
                  <MessagePreview>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      Последние сообщения:
                    </div>
                    {entry.context.messagesPreview.map((msg, index) => (
                      <MessageItem key={index}>
                        <MessageDirection direction={msg.direction}>
                          {msg.direction === 'incoming' ? '← ' : '→ '}
                        </MessageDirection>
                        {msg.text}
                      </MessageItem>
                    ))}
                  </MessagePreview>
                )}
              </ContextSection>
              
              <ActionButtons>
                <ActionButton 
                  className="expand"
                  onClick={() => toggleExpanded(entry.id)}
                >
                  {expandedEntries.has(entry.id) ? 'Свернуть' : 'Подробнее'}
                </ActionButton>
                <ActionButton 
                  className="delete"
                  onClick={() => handleDeleteEntry(entry.id)}
                >
                  Удалить
                </ActionButton>
              </ActionButtons>
            </HistoryEntry>
          ))}
        </HistoryList>
      )}
    </Container>
  );
}; 