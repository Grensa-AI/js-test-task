import React from "react";
import styled from "styled-components";

const TabContainer = styled.div`
  display: flex;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
`;

const Tab = styled.button`
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: ${(props) => (props.$active ? "#6366f1" : "transparent")};
  color: ${(props) => (props.$active ? "#ffffff" : "#6b7280")};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: ${(props) => (props.$active ? "#5856eb" : "#f3f4f6")};
    color: ${(props) => (props.$active ? "#ffffff" : "#374151")};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const Badge = styled.span`
  background: ${(props) =>
    props.$active ? "rgba(255, 255, 255, 0.2)" : "#e5e7eb"};
  color: ${(props) => (props.$active ? "#ffffff" : "#6b7280")};
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
`;

export const Tabs = ({ activeTab, onTabChange, historyCount = 0 }) => {
  return (
    <TabContainer>
      <Tab
        $active={activeTab === "summary"}
        onClick={() => onTabChange("summary")}
      >
        📋 Анализатор
      </Tab>
      <Tab
        $active={activeTab === "history"}
        onClick={() => onTabChange("history")}
      >
        📚 История
        {historyCount > 0 && (
          <Badge $active={activeTab === "history"}>{historyCount}</Badge>
        )}
      </Tab>
    </TabContainer>
  );
};
