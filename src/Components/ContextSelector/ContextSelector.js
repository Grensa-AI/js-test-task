import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const Container = styled.div`
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
  color: #111827;
  
  @media (max-width: 480px) {
    padding: 12px;
    margin: 8px 0;
  }
  
  @media (max-width: 360px) {
    padding: 8px;
    margin: 6px 0;
  }
`;

const Title = styled.h4`
  margin: 0 0 12px 0;
  color: #111827 !important;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #6b7280;
  
  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 12px;
    font-size: 11px;
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 360px) {
    gap: 4px;
    margin-bottom: 8px;
    font-size: 10px;
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  text-align: center;
  min-width: 0;
  overflow: hidden;
  
  @media (max-width: 480px) {
    padding: 6px;
  }
  
  @media (max-width: 360px) {
    padding: 4px;
  }
`;

const StatLabel = styled.div`
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
  
  @media (max-width: 360px) {
    font-size: 9px;
  }
`;

const StatValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-top: 2px;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
  
  @media (max-width: 360px) {
    font-size: 12px;
  }
`;

const RangeContainer = styled.div`
  margin: 16px 0;
`;

const RangeLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;

const RangeInput = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  margin: 8px 0;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6366f1;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6366f1;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const RangeValues = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
`;

const PresetButtons = styled.div`
  display: flex;
  gap: 8px;
  margin: 12px 0;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 6px;
    margin: 8px 0;
  }
  
  @media (max-width: 360px) {
    gap: 4px;
    margin: 6px 0;
  }
`;

const PresetButton = styled.button`
  background: ${props => props.active ? '#6366f1' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'} !important;
  border: 1px solid ${props => props.active ? '#6366f1' : '#e5e7eb'};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  
  @media (max-width: 480px) {
    padding: 3px 6px;
    font-size: 10px;
    max-width: 100px;
  }
  
  @media (max-width: 360px) {
    padding: 2px 4px;
    font-size: 9px;
    max-width: 80px;
  }
  
  &:hover {
    background: ${props => props.active ? '#5856f0' : '#f3f4f6'};
    border-color: ${props => props.active ? '#5856f0' : '#d1d5db'};
  }
`;

const ContextPreview = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 8px;
  margin: 12px 0;
  max-height: 120px;
  overflow-y: auto;
  font-size: 11px;
  line-height: 1.4;
`;

const MessagePreview = styled.div`
  margin-bottom: 4px;
  padding: 2px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const MessageSender = styled.span`
  font-weight: 500;
  color: ${props => props.direction === 'incoming' ? '#059669' : '#7c3aed'};
`;

const MessageText = styled.span`
  color: #374151;
  margin-left: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  
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

const ActionButton = styled.button`
  flex: 1;
  background: ${props => props.primary ? '#6366f1' : 'white'};
  color: ${props => props.primary ? 'white' : '#6b7280'} !important;
  border: 1px solid ${props => props.primary ? '#6366f1' : '#e5e7eb'};
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  
  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 11px;
  }
  
  @media (max-width: 360px) {
    padding: 4px 6px;
    font-size: 10px;
  }
  
  &:hover {
    background: ${props => props.primary ? '#5856f0' : '#f3f4f6'};
    border-color: ${props => props.primary ? '#5856f0' : '#d1d5db'};
  }
  
  &:disabled {
    background: #f3f4f6;
    color: #9ca3af !important;
    border-color: #e5e7eb;
    cursor: not-allowed;
  }
`;

const CollectionStatus = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
  font-size: 11px;
  color: #92400e;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin: 4px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #f59e0b;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;



export const ContextSelector = ({ 
  chatData, 
  onContextSelected, 
  onCollectMore,
  isVisible = false,
  onClose 
}) => {
  const { t } = useTranslation();
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [activePreset, setActivePreset] = useState(null);
  const [collectionProgress, setCollectionProgress] = useState(null);

  const messages = chatData?.messages || [];
  const totalMessages = messages.length;

  // Initialize end index to last message
  useEffect(() => {
    if (totalMessages > 0) {
      setEndIndex(totalMessages - 1);
    }
  }, [totalMessages]);

  // Get collection progress from window
  useEffect(() => {
    const checkProgress = () => {
      if (window.getCollectionProgress) {
        const progress = window.getCollectionProgress();
        setCollectionProgress(progress);
      }
    };

    const interval = setInterval(checkProgress, 500);
    return () => clearInterval(interval);
  }, []);

  const selectedMessages = useMemo(() => {
    if (!messages.length) return [];
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    return messages.slice(start, end + 1);
  }, [messages, startIndex, endIndex]);

  const contextStats = useMemo(() => {
    if (!selectedMessages.length) return null;
    
    const totalWords = selectedMessages.reduce((sum, msg) => sum + (msg.wordCount || 0), 0);
    const totalChars = selectedMessages.reduce((sum, msg) => sum + (msg.charCount || 0), 0);
    const incomingCount = selectedMessages.filter(msg => msg.direction === 'incoming').length;
    const outgoingCount = selectedMessages.filter(msg => msg.direction === 'outgoing').length;
    
    return {
      messageCount: selectedMessages.length,
      wordCount: totalWords,
      charCount: totalChars,
      incomingCount,
      outgoingCount
    };
  }, [selectedMessages]);

  const presets = useMemo(() => {
    if (!totalMessages) return [];
    
    return [
      { name: t('last10'), start: Math.max(0, totalMessages - 10), end: totalMessages - 1 },
      { name: t('last25'), start: Math.max(0, totalMessages - 25), end: totalMessages - 1 },
      { name: t('last50'), start: Math.max(0, totalMessages - 50), end: totalMessages - 1 },
      { name: t('selectAll'), start: 0, end: totalMessages - 1 },
      { name: t('incomingOnly'), start: 0, end: totalMessages - 1, filter: 'incoming' },
      { name: t('outgoingOnly'), start: 0, end: totalMessages - 1, filter: 'outgoing' }
    ];
  }, [totalMessages, t]);

  const handlePresetClick = (preset) => {
    setStartIndex(preset.start);
    setEndIndex(preset.end);
    setActivePreset(preset.name);
  };

  const handleCollectMore = async () => {
    if (window.collectMoreMessages) {
      setCollectionProgress({ isCollecting: true, progress: { current: 0, total: -1 } });
      
      try {
        const result = await window.collectMoreMessages((progress) => {
          setCollectionProgress({ isCollecting: true, progress });
        });
        
        if (onCollectMore) {
          onCollectMore(result);
        }
      } catch (error) {
      } finally {
        setCollectionProgress(null);
      }
    }
  };

  const handleGenerateSummary = () => {
    if (!selectedMessages.length) return;
    
    const contextInfo = {
      startIndex,
      endIndex,
      messageCount: selectedMessages.length,
      totalAvailable: totalMessages,
      selectedAt: new Date().toISOString(),
      stats: contextStats
    };
    
    const chatDataWithContext = {
      ...chatData,
      messages: selectedMessages,
      contextInfo
    };
    
    if (onContextSelected) {
      onContextSelected(chatDataWithContext);
    }
  };

  if (!isVisible) return null;

  return (
    <Container>
      <Title>
        {t('selectContext')}
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#6b7280', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </Title>

      {chatData?.stats && (
        <StatsContainer>
          <StatItem>
            <StatLabel>{t('totalMessages')}</StatLabel>
            <StatValue>{chatData.stats.totalMessages}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>{t('totalWords')}</StatLabel>
            <StatValue>{chatData.stats.totalWords}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>{t('incoming')}</StatLabel>
            <StatValue>{chatData.stats.incomingMessages}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>{t('outgoing')}</StatLabel>
            <StatValue>{chatData.stats.outgoingMessages}</StatValue>
          </StatItem>
        </StatsContainer>
      )}

      <PresetButtons>
        {presets.map((preset) => (
          <PresetButton
            key={preset.name}
            active={activePreset === preset.name}
            onClick={() => handlePresetClick(preset)}
          >
            {preset.name}
          </PresetButton>
        ))}
      </PresetButtons>

      {totalMessages > 0 && (
        <RangeContainer>
          <RangeLabel>{t('rangeStart', { number: startIndex + 1 })}</RangeLabel>
          <RangeInput
            type="range"
            min={0}
            max={totalMessages - 1}
            value={startIndex}
            onChange={(e) => {
              setStartIndex(parseInt(e.target.value));
              setActivePreset(null);
            }}
          />
          <RangeValues>
            <span>1</span>
            <span>{totalMessages}</span>
          </RangeValues>

          <RangeLabel>{t('rangeEnd', { number: endIndex + 1 })}</RangeLabel>
          <RangeInput
            type="range"
            min={0}
            max={totalMessages - 1}
            value={endIndex}
            onChange={(e) => {
              setEndIndex(parseInt(e.target.value));
              setActivePreset(null);
            }}
          />
          <RangeValues>
            <span>1</span>
            <span>{totalMessages}</span>
          </RangeValues>
        </RangeContainer>
      )}

      {contextStats && (
        <StatsContainer>
          <StatItem>
            <StatLabel>{t('selectedMessages')}</StatLabel>
            <StatValue>{contextStats.messageCount}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>{t('wordsInSelection')}</StatLabel>
            <StatValue>{contextStats.wordCount}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>{t('incoming')}</StatLabel>
            <StatValue>{contextStats.incomingCount}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>{t('outgoing')}</StatLabel>
            <StatValue>{contextStats.outgoingCount}</StatValue>
          </StatItem>
        </StatsContainer>
      )}

      {selectedMessages.length > 0 && (
        <ContextPreview>
          {selectedMessages.slice(0, 10).map((msg, index) => (
            <MessagePreview key={msg.id || index}>
              <MessageSender direction={msg.direction}>
                {msg.direction === 'incoming' ? t('participant') : t('me')}:
              </MessageSender>
              <MessageText>
                {msg.text?.length > 60 ? msg.text.substring(0, 60) + '...' : msg.text}
              </MessageText>
            </MessagePreview>
          ))}
          {selectedMessages.length > 10 && (
            <div style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
              {t('andMore', { count: selectedMessages.length - 10 })}
            </div>
          )}
        </ContextPreview>
      )}

      {collectionProgress?.isCollecting && (
        <CollectionStatus>
          <div>
            <div>{t('collectingMessages', { current: collectionProgress.progress.current, total: collectionProgress.progress.total > 0 ? `/${collectionProgress.progress.total}` : '' })}</div>
            <ProgressBar>
              <ProgressFill 
                progress={collectionProgress.progress.total > 0 ? (collectionProgress.progress.current / collectionProgress.progress.total) * 100 : 0} 
              />
            </ProgressBar>
          </div>
        </CollectionStatus>
      )}

      <ActionButtons>
        <ActionButton onClick={handleCollectMore} disabled={collectionProgress?.isCollecting}>
          {collectionProgress?.isCollecting ? t('collecting') : t('collectMore')}
        </ActionButton>
        <ActionButton 
          primary 
          onClick={handleGenerateSummary}
          disabled={selectedMessages.length === 0}
        >
          {t('createSummary', { count: selectedMessages.length })}
        </ActionButton>
      </ActionButtons>
    </Container>
  );
}; 