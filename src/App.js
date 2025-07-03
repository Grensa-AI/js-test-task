import React, { useState } from 'react';
import './styles/extension-window.css';
import Title from './Components/Title/Title';
import Summary from './Components/Summary/Summary';
import LoadingSpinner from './Components/LoadingSpinner/LoadingSpinner';
import './Components/LoadingSpinner/LoadingSpinner.css';

const App = () => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateSummary = () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setTimeout(() => {
      setSummary('Здесь будет резюме чата после интеграции с OpenAI API');
      setLoading(false);
      setSuccess('Резюме успешно сгенерировано');
    }, 1500);
  };

  return (
    <div className="grensa-extension-container">
      <Title />
      {error && <div className="grensa-window-error-message">{error}</div>}
      {success && <div className="grensa-window-success-message">{success}</div>}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Summary summary={summary} />
          <button onClick={generateSummary} className="grensa-generate-button">
            Обновить резюме
          </button>
        </>
      )}
    </div>
  );
};

export default App;
