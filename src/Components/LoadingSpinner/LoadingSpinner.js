import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ text = 'Генерация резюме...' }) {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <div className="loading-text">{text}</div>
    </div>
  );
}

export default LoadingSpinner; 