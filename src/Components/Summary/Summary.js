import React from "react";
import styled from "styled-components";
import { Spinner, Button, ErrorMessage } from "../UI";

const Container = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 160px;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
`;

const TextContainer = styled.div`
  flex: 1;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Text = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;

const HintBox = styled.div`
  background: #fef3cd;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 10px;
  margin: 8px 0;
  font-size: 12px;
  color: #92400e;
  line-height: 1.4;
`;

const InstructionBox = styled.div`
  background: #e0f2fe;
  border: 1px solid #81d4fa;
  border-radius: 6px;
  padding: 12px;
  margin: 12px 0;
  font-size: 13px;
  color: #0277bd;
  line-height: 1.4;
`;

const ButtonContainer = styled.div`
  margin-top: auto;
  padding-top: 12px;
`;

const RefreshButton = styled(Button)`
  width: 100%;
  height: 40px;
`;

export const Summary = ({
  summary,
  isLoading,
  error,
  onRefresh,
  isConfigured = true,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <ContentWrapper>
          <SummaryTitle>
            Генерация резюме <Spinner />
          </SummaryTitle>
          <TextContainer>
            <Text>Анализируем сообщения чата...</Text>
            <HintBox>
              ⏳ Получаем транскрипции аудио и обрабатываем видимые сообщения
            </HintBox>
          </TextContainer>
          <ButtonContainer>
            <RefreshButton disabled>Генерация...</RefreshButton>
          </ButtonContainer>
        </ContentWrapper>
      );
    }

    if (error) {
      return (
        <ContentWrapper>
          <SummaryTitle>⚠️ Ошибка</SummaryTitle>
          <TextContainer>
            <ErrorMessage>{error}</ErrorMessage>
            <HintBox>
              <strong>💡 Попробуйте:</strong> Прокрутите чат до места с
              текстовыми сообщениями и нажмите "Попробовать снова"
            </HintBox>
          </TextContainer>
          <ButtonContainer>
            <RefreshButton onClick={onRefresh}>Попробовать снова</RefreshButton>
          </ButtonContainer>
        </ContentWrapper>
      );
    }

    if (summary) {
      return (
        <ContentWrapper>
          <SummaryTitle>📝 Резюме чата</SummaryTitle>
          <TextContainer>
            <Text>{summary}</Text>
            <HintBox>
              <strong>💡 Подсказка:</strong> Расширение анализирует только
              сообщения, видимые на экране. Для анализа других частей чата
              прокрутите к нужному месту и нажмите "Обновить резюме".
            </HintBox>
          </TextContainer>
          <ButtonContainer>
            <RefreshButton onClick={onRefresh}>Обновить резюме</RefreshButton>
          </ButtonContainer>
        </ContentWrapper>
      );
    }

    return (
      <ContentWrapper>
        <SummaryTitle>📋 Анализатор чата</SummaryTitle>
        <TextContainer>
          <Text>Создайте умное резюме сообщений Telegram</Text>

          <InstructionBox>
            <strong>📖 Как использовать:</strong>
            <br />
            <strong>1.</strong> Прокрутите чат до интересующих сообщений
            <br />
            <strong>2.</strong> Нажмите кнопку "Создать резюме"
            <br />
            <strong>3.</strong> Получите анализ видимых сообщений
            <br />
            <strong>4.</strong> При необходимости повторите для других частей
          </InstructionBox>

          {!isConfigured && (
            <HintBox>
              ⚙️ <strong>Внимание:</strong> OpenAI API ключ не найден в
              настройках. Добавьте API ключ для работы расширения.
            </HintBox>
          )}
        </TextContainer>

        <ButtonContainer>
          <RefreshButton onClick={onRefresh}>📋 Создать резюме</RefreshButton>
        </ButtonContainer>
      </ContentWrapper>
    );
  };

  return <Container>{renderContent()}</Container>;
};
