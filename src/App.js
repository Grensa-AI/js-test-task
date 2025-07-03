import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { Title } from "./Components/Title/Title";
import { Summary } from "./Components/Summary/Summary";
import { useSummary } from "./hooks/useSummary";
import {
  STORAGE_KEY,
  CONTAINER_WIDTH,
  CONTAINER_MIN_HEIGHT,
} from "./config/constants";

const AppContainer = styled.div`
  width: 400px;
  height: auto;
  max-height: 600px;
  min-height: 400px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  overflow-y: auto;
  color: #111827;
  position: fixed;
  top: ${(props) => props.$top}px;
  left: ${(props) => props.$left}px;
  z-index: 10000;
  cursor: ${(props) => (props.$isDragging ? "grabbing" : "grab")};
  transition: ${(props) =>
    props.$isDragging ? "none" : "box-shadow 0.2s ease"};

  &:hover {
    box-shadow: ${(props) =>
      props.$isDragging
        ? "0 10px 25px rgba(0, 0, 0, 0.1)"
        : "0 15px 35px rgba(0, 0, 0, 0.15)"};
  }
`;

const getDefaultPosition = () => ({
  top: 20,
  left: Math.max(0, window.innerWidth - CONTAINER_WIDTH - 30),
});

export const App = () => {
  const { summary, isLoading, error, isConfigured, generateSummary } =
    useSummary();
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return getDefaultPosition();

      const parsed = JSON.parse(saved);

      const maxLeft = Math.max(0, window.innerWidth - CONTAINER_WIDTH);
      const maxTop = Math.max(0, window.innerHeight - CONTAINER_MIN_HEIGHT);

      return {
        top: Math.min(parsed.top, maxTop),
        left: Math.min(parsed.left, maxLeft),
      };
    } catch (_error) {
      return getDefaultPosition();
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const savePosition = useCallback((newPosition) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosition));
    } catch (_error) {
      //not critical
    }
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
      return;
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    });

    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        const newPosition = {
          left: Math.max(
            0,
            Math.min(
              window.innerWidth - CONTAINER_WIDTH,
              e.clientX - dragStart.x
            )
          ),
          top: Math.max(
            0,
            Math.min(
              window.innerHeight - CONTAINER_MIN_HEIGHT,
              e.clientY - dragStart.y
            )
          ),
        };
        setPosition(newPosition);
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      savePosition(position);
    }
  }, [isDragging, position, savePosition]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const maxLeft = Math.max(0, window.innerWidth - CONTAINER_WIDTH);
        const maxTop = Math.max(0, window.innerHeight - CONTAINER_MIN_HEIGHT);

        const newPosition = {
          left: Math.min(prev.left, maxLeft),
          top: Math.min(prev.top, maxTop),
        };

        if (newPosition.left !== prev.left || newPosition.top !== prev.top) {
          savePosition(newPosition);
        }

        return newPosition;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [savePosition]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      document.body.style.userSelect = "none";
      document.body.style.pointerEvents = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.pointerEvents = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleMessage = (request) => {
      if (request.action === "toggle") {
        generateSummary();
      }
    };

    if (window.chrome && chrome.runtime) {
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }
  }, [generateSummary]);

  return (
    <AppContainer
      $top={position.top}
      $left={position.left}
      $isDragging={isDragging}
      onMouseDown={handleMouseDown}
    >
      <Title />
      <Summary
        summary={summary}
        isLoading={isLoading}
        error={error}
        onRefresh={generateSummary}
        isConfigured={isConfigured}
      />
    </AppContainer>
  );
};
