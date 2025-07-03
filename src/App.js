import React, { useState } from 'react';
import './styles/extension-window.css';
import Title from './Components/Title/Title';
import Summary from './Components/Summary/Summary';

const App = () => {
  const [summary, setSummary] = useState('');

  const generateSummary = () => {
    setSummary('Здесь будет резюме чата после интеграции с OpenAI API');
  };

  return (
    <div className="grensa-extension-container">
      <Title />
      <Summary summary={summary} />
      <button onClick={generateSummary} className="grensa-generate-button">
        Обновить резюме
      </button>
    </div>
  );
};

export default App;
