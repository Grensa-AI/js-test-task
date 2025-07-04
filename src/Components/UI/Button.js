import styled from "styled-components";

export const Button = styled.button`
  background: #6366f1;
  color: #ffffff;
  border: none;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #5856eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;
