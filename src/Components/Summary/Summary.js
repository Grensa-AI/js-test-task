import React from "react";
import styled from "styled-components";
import { Spinner, Button, ErrorMessage } from "../UI";

const Container = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Text = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
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

const RefreshButton = styled(Button)`
  margin-top: 12px;
  width: 100%;
`;

export const Summary = ({
  summary,
  isLoading,
  error,
  onRefresh,
  isConfigured = true,
  transcriptionInfo = null,
}) => {
  const renderTranscriptionStatus = () => {
    if (!transcriptionInfo || transcriptionInfo.audioFound === 0) {
      return null;
    }

    const { audioFound, audioProcessed, audioFailed, hasIssues } =
      transcriptionInfo;

    if (hasIssues && audioFailed > 0) {
      return (
        <HintBox>
          🎵 Найдено {audioFound} аудио сообщений. Обработано: {audioProcessed},
          не удалось: {audioFailed}
        </HintBox>
      );
    }

    if (audioProcessed > 0) {
      return (
        <HintBox>
          ✅ Успешно обработано {audioProcessed} аудио сообщений
        </HintBox>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <SummaryTitle>
            Генерация резюме <Spinner />
          </SummaryTitle>
          <Text>Анализируем сообщения чата...</Text>
          <HintBox>
            ⏳ Получаем транскрипции аудио и обрабатываем видимые сообщения
          </HintBox>
        </>
      );
    }

    if (error) {
      return (
        <>
          <SummaryTitle>⚠️ Ошибка</SummaryTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <HintBox>
            <strong>💡 Возможные решения:</strong>
            <br />
            • Обновите ключ API
            <br />
            • Прокрутите чат до места с текстом
            <br />• Проверьте подключение к интернету
          </HintBox>
          <RefreshButton onClick={onRefresh}>Попробовать снова</RefreshButton>
        </>
      );
    }

    if (summary) {
      return (
        <>
          <SummaryTitle>📝 Резюме чата</SummaryTitle>
          <Text>{summary}</Text>

          {renderTranscriptionStatus()}

          <HintBox>
            <strong>💡 Подсказка:</strong> Расширение анализирует только
            сообщения, видимые на экране. Для анализа других частей чата
            прокрутите к нужному месту и нажмите "Обновить резюме".
          </HintBox>
          <RefreshButton onClick={onRefresh}>Обновить резюме</RefreshButton>
        </>
      );
    }

    return (
      <>
        <SummaryTitle>📋 Анализатор чата</SummaryTitle>
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

        <RefreshButton onClick={onRefresh}>📋 Создать резюме</RefreshButton>
      </>
    );
  };

  return <Container>{renderContent()}</Container>;
};
