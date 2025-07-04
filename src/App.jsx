import React, { useState, useEffect } from "react";
import { FloatingToggleButton } from "./Components/FloatingToggleButton/FloatingToggleButton";
import { FloatingWindow } from "./Components/FloatingWindow/FloatingWindow";

export const App = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [pos, setPos] = useState({ top: 80, left: 80 });

  useEffect(() => {
    const saved = localStorage.getItem("extensionPos");
    if (saved) {
      setPos(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--top", `${pos.top}px`);
    document.documentElement.style.setProperty("--left", `${pos.left}px`);
  }, [pos]);

  const handleDrag = (newPos) => {
    setPos(newPos);
    localStorage.setItem("extensionPos", JSON.stringify(newPos));
  };

  return (
    <>
      {!isOpen && <FloatingToggleButton onClick={() => setIsOpen(true)} />}
      {isOpen && <FloatingWindow onClose={() => setIsOpen(false)} onDrag={handleDrag} />}
    </>
  );
};
