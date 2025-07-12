import React, {useState} from "react";
import styled from "styled-components";


const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
`;

const Answer = styled.div`
  margin-top: 15px;
  padding: 10px;
  background: #e0f2f1;
  border-radius: 6px;
  color: #065f46;
  font-size: 14px;
`;

function askGPTMock(message) {
  return Promise.resolve({
    choices: [
      {message: {content: `GPT-ответ на: ${message}`}}
    ]
  });
}


function parseTelegramMessage() {
  const messages = Array.from(document.querySelectorAll('.message.spoilers-container'))
    .map(el => el.innerText.trim())
    .filter(Boolean);

  return messages;
}

export const Summary = () => {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAsk = async () => {
    const messages = parseTelegramMessage();
    if (messages.length === 0) {
      setAnswer("Сообщений не найдено");
      return;
    }

    const combined = messages.join("\n");
    setInput(combined);
    const result = await askGPTMock(combined);
    setAnswer(result.choices[0].message.content);
  };

  return (
    <Container>
      <TextArea
        value={input}
        readOnly
        placeholder="Сообщения из Telegram появятся здесь"
      />

      <Button onClick={handleAsk}>Спросить GPT</Button>
      {answer && <Answer>{answer}</Answer>}
    </Container>
  ); 
}
