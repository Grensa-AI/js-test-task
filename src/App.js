import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Title } from "./Components/Title/Title";
import { Summary } from "./Components/Summary/Summary";
import { History } from "./Components/History/History";

const AppContainer = styled.div`
  width: 400px;
  height: auto;
  max-height: 500px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  overflow-y: auto;
  color: #111827;
`;

const ButtonText = styled.button`
  color: #6366f1;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.3s ease;
  
  &:hover {
    background-color:rgba(99, 101, 241, 0.2);
  }
`;

export const App = () => {
  const [messages, setMessages] = useState([]);
  const [isOpenHistory, setOpenHistory] = useState(false);

  // Получаем парсинг сообщений, слушая событие TELEGRAM_CHAT
  useEffect(() => {
    function handleMessage(event) {
      if (event.data && event.data.type === "TELEGRAM_CHAT") {
        setMessages(event.data.payload);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <AppContainer>
      <Title />
      {isOpenHistory && (
        <>
          <History />
          <ButtonText onClick={() => setOpenHistory(false)} style={{ marginTop: 16 }}>Назад</ButtonText>
        </>
      )}
      {!isOpenHistory && (
        <>
          <Summary messages={messages} />
          <ButtonText onClick={() => setOpenHistory(true)} style={{ marginTop: 16 }}>История резюме</ButtonText>
        </>
      )}
    </AppContainer>
  );
};
