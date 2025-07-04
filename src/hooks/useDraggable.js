import { useState, useEffect, useCallback } from "react";

export const useDraggable = (initialPosition, { width, height }) => {
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem("telegram-extension-position");
      if (!saved) return initialPosition;

      const parsed = JSON.parse(saved);
      const maxLeft = Math.max(0, window.innerWidth - width);
      const maxTop = Math.max(0, window.innerHeight - height);

      return {
        top: Math.min(parsed.top, maxTop),
        left: Math.min(parsed.left, maxLeft),
      };
    } catch (error) {
      return initialPosition;
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const savePosition = useCallback((newPosition) => {
    try {
      localStorage.setItem(
        "telegram-extension-position",
        JSON.stringify(newPosition)
      );
    } catch (_error) {
      //не критично, не перехватываем
    }
  }, []);

  const handleMouseDown = useCallback((e, currentPosition) => {
    if (
      e.target.tagName === "BUTTON" ||
      e.target.closest("button") ||
      e.target.closest(".history-item") ||
      e.target.closest(".tab-container")
    ) {
      return;
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - currentPosition.left,
      y: e.clientY - currentPosition.top,
    });

    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        const newPosition = {
          left: Math.max(
            0,
            Math.min(window.innerWidth - width, e.clientX - dragStart.x)
          ),
          top: Math.max(
            0,
            Math.min(window.innerHeight - height, e.clientY - dragStart.y)
          ),
        };
        setPosition(newPosition);
      }
    },
    [isDragging, dragStart, width, height]
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
        const maxLeft = Math.max(0, window.innerWidth - width);
        const maxTop = Math.max(0, window.innerHeight - height);

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
  }, [width, height, savePosition]);

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

  return {
    position,
    isDragging,
    handleMouseDown: (e) => handleMouseDown(e, position),
  };
};
