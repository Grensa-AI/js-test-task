import { useState, useEffect } from "react";
import styled from "styled-components";
import { Title } from "@src/Components/Title/Title";
import { SummaryPage } from "@src/pages/Summary";
import { SettingsPage } from "@src/pages/Settings";
import { useTranslation } from "react-i18next";

export const AppContainer = styled.div`
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
  position: relative;

  display: ${props => (props.hidden ? "none" : "block")};
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
`;

const MinimizeButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #2563eb;
  font-size: 20px;
  cursor: pointer;
  user-select: none;
  padding: 0;
  line-height: 1;
`;

export const AppContent = () => {
  const [screen, setScreen] = useState("summary");
  const [hidden, setHidden] = useState(false);

  const { t } = useTranslation();

  // Show widget again when event is dispatched
  useEffect(() => {
    function handleShowWidget() {
      setHidden(false);
    }
    window.addEventListener("show-extension-widget", handleShowWidget);
    return () => window.removeEventListener("show-extension-widget", handleShowWidget);
  }, []);

  return (
    <AppContainer hidden={hidden}>
      <MinimizeButton
        aria-label="Minimize widget"
        onClick={() => setHidden(true)}
        title="Minimize"
      >
        −
      </MinimizeButton>
      <Title />
      <Nav>
        <button
          className={screen === "summary" ? "active" : ""}
          onClick={() => setScreen("summary")}
        >
          {t("summary")}
        </button>
        <button
          className={screen === "settings" ? "active" : ""}
          onClick={() => setScreen("settings")}
        >
          {t("settings")}
        </button>
      </Nav>
      {screen === "summary" && <SummaryPage />}
      {screen === "settings" && <SettingsPage />}
    </AppContainer>
  );
};
