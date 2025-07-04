import styled from "styled-components";
import { Title } from "../../Components/Title/Title";
import { Summary } from "../../Components/Summary/Summary";

const DraggableWindow = styled.div`
  position: fixed;
  top: var(--top, 80px);
  left: var(--left, 80px);
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 16px;
  z-index: 10000;
  cursor: move;
  width: 400px;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
`;

export const FloatingWindow = ({ onClose, onDrag }) => {
  const startDrag = (e) => {
    const onMouseMove = (moveEvent) => {
      const newPos = {
        left: moveEvent.clientX - 200,
        top: moveEvent.clientY - 20,
      };
      onDrag(newPos);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <DraggableWindow onMouseDown={startDrag}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>Grensa.AI</strong>
        <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
          ❌
        </button>
      </div>
      <Title />
      <Summary />
    </DraggableWindow>
  );
};
