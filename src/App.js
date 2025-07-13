import { useState } from "react";
import styled from "styled-components";
import { Title } from "@src/Components/Title/Title";
import { SummaryPage } from "@src/pages/SummaryPage";

const AppContainer = styled.div`
  width: 400px;
  height: auto;
  max-height: 500px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  overflow-y: auto;
  color: #111827;
`;

const Nav = styled.div`
  margin-bottom: 10px;
  display: flex;
  gap: 5px;

  button {
    background: none;
    border: none;
    color: #2563eb;
    padding: 5px 10px;
    cursor: pointer;
    font-weight: 500;
    border-radius: 4px;
    &.active {
      background: #2563eb;
      color: #ffffff;
    }
    &:not(.active):hover {
      background-color: #e5e7eb;
    }
  }
`

export const App = () => {
  const [screen, setScreen] = useState("summary");

  return (
    <AppContainer>
      <Title />
      <Nav>
        <button className={screen === "summary" ? "active" : ""} onClick={() => setScreen("summary")}>
          Summary
        </button>
        <button className={screen === "settings" ? "active" : ""} onClick={() => setScreen("settings")}>
          Settings
        </button>
        <button className={screen === "history" ? "active" : ""} onClick={() => setScreen("history")}>
          History
        </button>
      </Nav>
      {screen === "summary" && <SummaryPage />}
      {screen === "settings" && <h1>Settings</h1>}
      {screen === "history" && <h1>History</h1>}
    </AppContainer>
  );
};
