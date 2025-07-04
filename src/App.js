import React, { useState, useEffect } from 'react';
import './styles/extension-window.css';
import Title from './Components/Title/Title';
import Summary from './Components/Summary/Summary';
import History from './Components/History/History';
import Export from './Components/Export/Export';
import LoadingSpinner from './Components/LoadingSpinner/LoadingSpinner';
import './Components/LoadingSpinner/LoadingSpinner.css';

const App = () => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [currentView, setCurrentView] = useState('summary'); 
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

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
    setSelectedHistoryItem(null);
    
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
        setCurrentView('summary');
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

  const handleHistoryItemSelect = (item) => {
    setSelectedHistoryItem(item);
    setSummary(item.summary);
    setCurrentView('summary');
    setSuccess(`Загружено резюме от ${new Date(item.timestamp).toLocaleString('ru-RU')}`);
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
      
      {/* Переключатель вкладок */}
      <div className="grensa-tabs">
        <button 
          className={`grensa-tab ${currentView === 'summary' ? 'active' : ''}`}
          onClick={() => setCurrentView('summary')}
        >
          Текущее резюме
        </button>
        <button 
          className={`grensa-tab ${currentView === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentView('history')}
        >
          История
        </button>
        <button 
          className={`grensa-tab ${currentView === 'export' ? 'active' : ''}`}
          onClick={() => setCurrentView('export')}
        >
          Экспорт
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {currentView === 'summary' && (
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
          
          {currentView === 'history' && (
            <History onSelectSummary={handleHistoryItemSelect} />
          )}
          
          {currentView === 'export' && (
            <Export 
              summary={summary} 
              historyItem={selectedHistoryItem}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
