
import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Spinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid white;
  width: 30px;
  height: 30px;
  animation: ${spin} 1s linear infinite;
  margin-right: 12px;
`;

const LoadingText = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

function LoadingSpinner({ text = 'Генерация резюме...' }) {
  return (
    <SpinnerContainer>
      <Spinner />
      <LoadingText>{text}</LoadingText>
    </SpinnerContainer>
  );
}

export default LoadingSpinner;
