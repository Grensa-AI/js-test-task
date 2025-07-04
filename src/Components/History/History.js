import React, { useState, useEffect } from 'react';
import './History.css';

const History = ({ onSelectSummary }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const result = await chrome.storage.local.get(['summaryHistory']);
      const historyData = result.summaryHistory || [];
      setHistory(historyData);
    } catch (error) {
      setError('Ошибка загрузки истории');
      console.error('Ошибка загрузки истории:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateSummary = (summary, maxLength = 100) => {
    if (summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength) + '...';
  };

  const clearHistory = async () => {
    try {
      await chrome.storage.local.remove(['summaryHistory']);
      setHistory([]);
    } catch (error) {
      setError('Ошибка очистки истории');
      console.error('Ошибка очистки истории:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const updatedHistory = history.filter(item => item.id !== id);
      await chrome.storage.local.set({ summaryHistory: updatedHistory });
      setHistory(updatedHistory);
    } catch (error) {
      setError('Ошибка удаления записи');
      console.error('Ошибка удаления записи:', error);
    }
  };

  if (loading) {
    return (
      <div className="grensa-history-container">
        <div className="grensa-history-loading">Загрузка истории...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grensa-history-container">
        <div className="grensa-history-error">{error}</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="grensa-history-container">
        <div className="grensa-history-empty">
          <div className="grensa-history-empty-icon">📋</div>
          <div className="grensa-history-empty-text">
            История резюме пуста
          </div>
          <div className="grensa-history-empty-subtext">
            Сгенерируйте первое резюме чата
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grensa-history-container">
      <div className="grensa-history-header">
        <h3 className="grensa-history-title">История резюме</h3>
        <button 
          className="grensa-history-clear-btn"
          onClick={clearHistory}
          title="Очистить всю историю"
        >
          Очистить
        </button>
      </div>
      
      <div className="grensa-history-list">
        {history.map((item) => (
          <div key={item.id} className="grensa-history-item">
            <div className="grensa-history-item-content">
              <div className="grensa-history-item-header">
                <span className="grensa-history-item-date">
                  {formatDate(item.timestamp)}
                </span>
                <span className="grensa-history-item-count">
                  {item.messageCount} сообщений
                </span>
              </div>
              <div className="grensa-history-item-summary">
                {truncateSummary(item.summary)}
              </div>
              <div className="grensa-history-item-actions">
                <button 
                  className="grensa-history-view-btn"
                  onClick={() => onSelectSummary(item)}
                  title="Просмотреть полное резюме"
                >
                  Просмотреть
                </button>
                <button 
                  className="grensa-history-delete-btn"
                  onClick={() => deleteItem(item.id)}
                  title="Удалить из истории"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History; 