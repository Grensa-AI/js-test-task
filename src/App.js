import React, { useState, useEffect } from 'react';
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
  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    // Проверяем, есть ли API ключ при загрузке
    checkApiKey();
  }, []);

  // Автоматически скрываем успешные сообщения через 5 секунд
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const checkApiKey = async () => {
    try {
      const hasKey = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'hasApiKey' }, resolve);
      });
      if (!hasKey.hasApiKey) {
        setNeedsApiKey(true);
      } else {
        setNeedsApiKey(false);
      }
    } catch (error) {
      console.error('Ошибка проверки API ключа:', error);
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!window.location.href.includes('web.telegram.org')) {
        throw new Error('Откройте Telegram Web для использования расширения');
      }
      
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'getChatSummary' }, resolve);
      });
      
      if (!response || response.error) {
        if (response && response.needsApiKey) {
          setNeedsApiKey(true);
        }
        let userMessage = 'Ошибка при генерации резюме';
        if (response && response.details) {
          const details = response.details;
          if (details.includes('503')) userMessage = 'Сервис провайдера временно недоступен. Попробуйте позже.';
          else if (details.includes('429')) userMessage = 'Превышен лимит запросов. Подождите и попробуйте снова.';
          else if (details.includes('401')) userMessage = 'Неверный API ключ или настройки.';
          else if (details.includes('quota')) userMessage = 'Исчерпана квота на использование API.';
          else userMessage = response.error + (details ? `\n${details}` : '');
        } else if (response && response.error) {
          userMessage = response.error;
        }
        throw new Error(userMessage);
      }
      
      if (response.success) {
        setSummary(response.summary);
        setSuccess(`Резюме сгенерировано для ${response.messageCount} сообщений`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeMessage = (type) => {
    if (type === 'error') {
      setError('');
    } else if (type === 'success') {
      setSuccess('');
    }
  };

  const MessageComponent = ({ message, type, onClose }) => {
    if (!message) return null;
    
    return (
      <div className={`grensa-window-${type}-message`}>
        {message}
        <button 
          className="grensa-message-close" 
          onClick={() => onClose(type)}
          title="Закрыть"
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="grensa-extension-container">
      <Title />
      <MessageComponent 
        message={error} 
        type="error" 
        onClose={closeMessage} 
      />
      <MessageComponent 
        message={success} 
        type="success" 
        onClose={closeMessage} 
      />
      {needsApiKey && (
        <div className="grensa-window-error-message">
          Для работы расширения необходимо настроить API ключ в настройках
        </div>
      )}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Summary summary={summary} />
          <button 
            onClick={generateSummary} 
            className="grensa-generate-button"
            disabled={needsApiKey}
          >
            Обновить резюме
          </button>
        </>
      )}
    </div>
  );
};

export default App;
