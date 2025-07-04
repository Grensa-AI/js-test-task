import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { generateSummary } from "../../api/openai";
import loadingGIF from "./../../assets/loading.gif"
import { saveResume } from "../../api/resumeHistory";

const Container = styled.div`
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
  overflow-x: auto;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
`;

const Text = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;

const TextClick = styled.p`
  margin: 0;
  color: #6366f1;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  transition: 0.3s ease;
  
  &:hover {
    color: #4f46e5;
  }
`;

const Button = styled.button`
  background-color: #6366f1;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.3s ease;
  
  &:hover {
    background-color: #4f46e5;
  }
`;

export const Summary = ({ messages = [] }) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Убираем ответ, если пришли новые сообщения
  useEffect(() => {
    setSummary(null);
  }, [messages]);

  // Вызов генерации резюме и обработка ошибок
  const handleGenerateSummary = async () => {
    setIsLoading(true);

    try {
      const summary = await generateSummary(messages);
      setSummary(summary);
      saveResume(summary);
    } catch (error) {
      setSummary(`Произошла ошибка: ${error}`);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Container>
        <SummaryTitle>Резюме</SummaryTitle>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <img style={{ width: 40, height: 40 }} src={loadingGIF} alt="Загрузка..." />
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <SummaryTitle>Резюме</SummaryTitle>

      {summary && (
        <> 
          <Text>{summary}</Text>
          <TextClick onClick={handleGenerateSummary}>Попробовать снова</TextClick>
        </>
      )}

      {!summary && (
        <>
          {messages.length > 0 && (
            <>
              <ul style={{ paddingLeft: 16, marginBottom: 16 }}>
                {messages.map((message, index) => (
                  <li key={index} style={{ color: '#6b7280', fontSize: 14, marginBottom: 4 }}>{message}</li>
                ))}
              </ul>

              <Button onClick={handleGenerateSummary}>Сгенерировать резюме</Button>
            </>
          )}
          
          {messages.length === 0 && (
            <Text>
              Нет данных чата. Откройте Telegram Web и обновите страницу.
            </Text>
          )}
        </>
      )}
    </Container>
  );
};
