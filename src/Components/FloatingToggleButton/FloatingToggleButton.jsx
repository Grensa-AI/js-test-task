import styled from "styled-components";

const ToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 20px;
  cursor: pointer;
  z-index: 9999;
`;

export const FloatingToggleButton = ({ onClick }) => {
  return (
    <ToggleButton onClick={onClick} title="Открыть резюме">
      AI
    </ToggleButton>
  );
};
