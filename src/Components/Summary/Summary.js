import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";

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
`;

const Text = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;


export const Summary = () => {
  const [messagesFromTG, setMessages] = useState([]);

  useEffect(() => {
    function getMessagesFromTelegram() {
      const messageNodes = document.querySelectorAll(".text-content");

      const messages = Array.from(messageNodes).map((node) => {
        const clone = node.cloneNode(true);
        const meta = clone.querySelector(".MessageMeta");
        if (meta) meta.remove();
        return clone.innerText.trim();
      });

      return messages;
    }

    const observer = new MutationObserver(() => {
      const messages = getMessagesFromTelegram();
      if (messages.length > 0) {
        console.log("📥 Сообщения найдены:", messages);
        setMessages(messages);
        observer.disconnect(); // отключаем, чтобы не перезапускалось
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);
  return (
    <Container>
      <SummaryTitle>Резюме</SummaryTitle>
      <Text>
        текст резюме
      </Text>
    </Container>
  );
};
