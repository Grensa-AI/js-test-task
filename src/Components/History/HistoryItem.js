import React from "react";
import styled from "styled-components";
import { formatTime } from "../../utils/formatTime";

const ItemContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 0;
  flex-shrink: 0;
  z-index: 1;
  pointer-events: auto;
  user-select: none;

  &:hover {
    z-index: 2;
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    transform: translateY(1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ItemTime = styled.div`
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  z-index: 3;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;

  &:hover {
    background: #fecaca;
    border-color: #fca5a5;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ItemPreview = styled.div`
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin-bottom: 8px;
  word-wrap: break-word;
`;

const ItemMeta = styled.div`
  font-size: 11px;
  color: #9ca3af;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 2px;
`;

export const HistoryItem = ({ item, onSelect, onRemove }) => {
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <ItemContainer
      onClick={() => {
        onSelect(item);
      }}
    >
      <ItemHeader>
        <ItemTime>🕐 {formatTime(item.timestamp)}</ItemTime>
        <RemoveButton onClick={handleRemove}>×</RemoveButton>
      </ItemHeader>

      <ItemPreview>{item.preview}</ItemPreview>

      <ItemMeta>
        <MetaItem>📝 {item.chatInfo.messagesCount} сообщений</MetaItem>
        {item.chatInfo.hasAudio && <MetaItem>🎵 Аудио</MetaItem>}
        {item.chatInfo.title && item.chatInfo.title !== "Неизвестный чат" && (
          <MetaItem>💬 {item.chatInfo.title}</MetaItem>
        )}
      </ItemMeta>
    </ItemContainer>
  );
};
