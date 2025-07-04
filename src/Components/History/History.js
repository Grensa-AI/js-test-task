import React, { useState } from "react";
import styled from "styled-components";
import { HistoryItem } from "./HistoryItem";
import { Button, ErrorMessage } from "../UI";

const Container = styled.div`
  height: 420px;
  padding: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  overflow: hidden auto;
`;

const ErrorContainer = styled.div`
  margin-bottom: 12px;
  position: relative;
  flex-shrink: 0;
`;

const DismissButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;

  &:hover {
    opacity: 0.7;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
`;

const Title = styled.h3`
  margin: 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ClearButton = styled(Button)`
  background: transparent;
  color: #111827;
  font-size: 12px;
  padding: 6px 10px;
  border: 1px solid transparent;
  transition: border-color 0.2s ease;

  &:hover {
    background: transparent;
    border-color: #e5e7eb;
  }
`;

const HistoryList = styled.div`
  flex: 1;
  overflow: hidden auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
  position: relative;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  text-align: center;
  padding: 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ConfirmBox = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  max-width: 320px;
  margin: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 18px;
  font-weight: 600;
`;

const ConfirmText = styled.p`
  margin: 0 0 20px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ConfirmButton = styled(Button)`
  flex: 1;

  &:hover {
    background: #dc2626;
  }
`;

const CancelButton = styled(Button)`
  flex: 1;
  background: #6b7280;

  &:hover {
    background: #4b5563;
  }
`;

export const History = ({
  history,
  onSelectSummary,
  onClearHistory,
  onRemoveItem,
  error,
  onClearError,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmClear = () => {
    onClearHistory();
    setShowConfirm(false);
  };

  const handleCancelClear = () => {
    setShowConfirm(false);
  };

  const renderEmptyState = () => (
    <EmptyState>
      <EmptyIcon>📝</EmptyIcon>
      <EmptyTitle>История пуста</EmptyTitle>
      <EmptyDescription>
        Создайте резюме чата, чтобы увидеть их здесь.
      </EmptyDescription>
    </EmptyState>
  );

  return (
    <>
      <Container>
        {error && (
          <ErrorContainer>
            <ErrorMessage>
              {error}
              <DismissButton onClick={onClearError}>×</DismissButton>
            </ErrorMessage>
          </ErrorContainer>
        )}

        {history.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Header>
              <Title>Сохраненные резюме</Title>
              <HeaderActions>
                <ClearButton onClick={handleClearClick}>
                  🗑️ Очистить
                </ClearButton>
              </HeaderActions>
            </Header>

            <HistoryList>
              {history.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onSelect={() => {
                    onSelectSummary(item);
                  }}
                  onRemove={() => onRemoveItem(item.id)}
                />
              ))}
            </HistoryList>
          </>
        )}
      </Container>

      {showConfirm && (
        <ConfirmDialog onClick={handleCancelClear}>
          <ConfirmBox onClick={(e) => e.stopPropagation()}>
            <ConfirmTitle>🗑️ Очистить историю?</ConfirmTitle>
            <ConfirmText>
              Все сохраненные резюме будут удалены безвозвратно.
            </ConfirmText>
            <ConfirmActions>
              <CancelButton onClick={handleCancelClear}>Отменить</CancelButton>
              <ConfirmButton onClick={handleConfirmClear}>
                Удалить все
              </ConfirmButton>
            </ConfirmActions>
          </ConfirmBox>
        </ConfirmDialog>
      )}
    </>
  );
};
