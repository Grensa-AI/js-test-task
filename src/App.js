import React, { useState } from "react"
import styled from "styled-components"
import { Title } from "./Components/Title/Title"
import { Summary } from "./Components/Summary/Summary"

const AppContainer = styled.div`
  width: 400px;
  height: auto;
  max-height: 500px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(27, 27, 27, 0.1);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow-y: auto;
  color: #111827;
`

const RefreshButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: #4f46e5;
  }

  &:disabled {
    background: #a5b4fc;
    cursor: not-allowed;
  }
`

export const App = ({ onGenerateSummary }) => {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <AppContainer>
      <Title />
      <Summary key={refreshKey} onGenerateSummary={onGenerateSummary} />
      <RefreshButton onClick={handleRefresh}>Обновить резюме</RefreshButton>
    </AppContainer>
  )
}
