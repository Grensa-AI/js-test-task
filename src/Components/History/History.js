import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getResume, removeResume } from "../../api/resumeHistory";

const Container = styled.div`
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
  overflow-x: auto;
`;

const HistoryTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
`;

const Resume = styled.div`
  margin: 8px 0;
  padding: 8px;
  background-color: #fff;
  border-radius: 4px;
  overflow-x: auto;
`;

const Text = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;

const TextDangerClick = styled.p`
  color: rgb(189, 68, 68);
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  transition: 0.3s ease;
  display: inline;
  
  &:hover {
    color: rgba(189, 68, 68, 0.8);
  }
`;

export const History = () => {
  const [resumeList, setResumeList] = useState([]);

  useEffect(() => {
    setResumeList(getResume());
  }, []);

  const handleRemoveResume = (index) => {
    removeResume(index);
    setResumeList(getResume());
  }

  return (
    <Container>
      <HistoryTitle>История резюме</HistoryTitle>

      {resumeList.length === 0 && <Text>Вы ещё не генерировали резюме.</Text>}

      {resumeList.map((resume, index) => (
        <Resume key={index}>
          <Text>{resume}</Text>
          <TextDangerClick onClick={() => handleRemoveResume(index)} style={{ marginTop: 8 }}>Удалить</TextDangerClick>
        </Resume>
      ))}
    </Container>
  );
};
