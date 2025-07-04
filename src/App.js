/**
 * App.js - Главное окно расширения Grensa.AI
 * 
 * Этот файл - это как "лицо" нашего расширения. Когда пользователь нажимает на иконку 
 * расширения в браузере, открывается именно это окно.
 * 
 * Что здесь происходит:
 * 1. Показываем пользователю красивое окно с заголовком "Grensa.AI"
 * 2. Есть две вкладки: "Суммари" и "История"
 * 3. На вкладке "Суммари" можно:
 *    - Нажать кнопку "Обновить резюме" чтобы проанализировать текущий чат
 *    - Посмотреть результат анализа (краткое содержание чата)
 *    - Включить/выключить автоматическое обновление при смене чата
 *    - Сохранить резюме в историю
 * 4. На вкладке "История" можно:
 *    - Посмотреть все ранее сохраненные резюме
 *    - Скопировать или удалить любое резюме
 *    - Экспортировать всю историю в текстовый файл
 * 
 * Окно можно перетаскивать мышкой по экрану, и оно запомнит свою позицию.
 * Если нет настроенного API ключа, показываем сообщение о необходимости настройки.
 * 
 * Этот файл использует React для создания интерфейса и общается с другими частями
 * расширения через Chrome Extensions API.
 */

import React, { useState, useEffect, useRef } from 'react';
import './styles/options.css';
import './styles/extension-window.css';
import Title from './Components/Title/Title';
import Summary from './Components/Summary/Summary';
import LoadingSpinner from './Components/LoadingSpinner/LoadingSpinner';
import extensionWindowCss from '!!raw-loader!./styles/extension-window.css';
import ReactMarkdown from 'react-markdown';

export const App = () => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [currentChatId, setCurrentChatId] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoUpdate, setAutoUpdate] = useState(() => {
    const saved = sessionStorage.getItem('grensa-auto-update');
    return saved === null ? true : saved === 'true';
  });
  const autoUpdateRef = useRef(autoUpdate);
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [hasSettings, setHasSettings] = useState(false);
  const [autoUpdatePaused, setAutoUpdatePaused] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [history, setHistory] = useState([]);
  const [autoSaveHistory, setAutoSaveHistory] = useState(() => {
    const saved = localStorage.getItem('grensa-auto-save-history');
    return saved === null ? true : saved === 'true';
  });
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const chatChangeTimeout = useRef(null);
  const lastPendingChatId = useRef(null);
  const lastRequestedChatId = useRef(null);
  const lastSelectedChatId = useRef(currentChatId);

  useEffect(() => {
    sessionStorage.setItem('grensa-auto-update', autoUpdate);
  }, [autoUpdate]);

  useEffect(() => {
    autoUpdateRef.current = autoUpdate;
  }, [autoUpdate]);

  useEffect(() => {
    // Получаем настройки из background.js
    fetchProviderSettings();
    
    // Проверяем, есть ли API ключ при загрузке (только в памяти background.js)
    checkApiKey();
    
    // Слушаем сообщения от content script
    const messageListener = (message, sender, sendResponse) => {
      if (message.action === 'chatChanged') {
        handleChatChange(message.chatId);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Сброс ошибок при открытии окна
    setError('');
    setSuccess('');

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('grensa-auto-save-history', autoSaveHistory);
  }, [autoSaveHistory]);

  useEffect(() => {
    // Загружаем историю из localStorage при старте
    const saved = localStorage.getItem('grensa-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Сохраняем историю при изменении
    localStorage.setItem('grensa-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    // Вставляем стили прямо в DOM, если их ещё нет
    if (!document.getElementById('grensa-extension-style')) {
      const style = document.createElement('style');
      style.id = 'grensa-extension-style';
      style.textContent = extensionWindowCss;
      document.head.appendChild(style);
    }
  }, []);

  const fetchProviderSettings = async () => {
    const settings = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getProviderSettings' }, resolve);
    });
    setProvider(settings.provider || '');
    setModel(settings.model || '');
    setApiKey(settings.apiKey || '');
    setHasSettings(!!settings.apiKey && !!settings.model && !!settings.provider);
  };

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

    }
  };

  const handleChatChange = async (chatId) => {
    if (loading) {
      lastSelectedChatId.current = chatId;
      return;
    }
    if (chatId !== currentChatId) {
      if (chatChangeTimeout.current) {
        clearTimeout(chatChangeTimeout.current);
        chatChangeTimeout.current = null;
      }
      lastPendingChatId.current = chatId;
      lastSelectedChatId.current = chatId;
      chatChangeTimeout.current = setTimeout(() => {
        if (lastPendingChatId.current === chatId && autoUpdateRef.current && !loading && !autoUpdatePaused) {
          setCurrentChatId(chatId);
          setSummary('');
          setError('');
          setSuccess('');
          lastRequestedChatId.current = chatId;
          generateSummaryDirect();
        }
        chatChangeTimeout.current = null;
      }, 3000);
    }
  };

  const generateSummary = async () => {
    setAutoUpdatePaused(true);
    // Получаем актуальные настройки напрямую
    const settings = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getProviderSettings' }, resolve);
    });
    if (!settings.apiKey || !settings.model || !settings.provider) {
      setError('Введите API-ключ и модель в настройках расширения');
      return;
    }
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
        // Улучшенная обработка ошибок
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
        setCurrentChatId(response.chatId);
        setLastUpdate(new Date());
        setSuccess(`Резюме сгенерировано для ${response.messageCount} сообщений`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setAutoUpdatePaused(false);
    }
  };

  const generateSummaryDirect = async () => {
    // Получаем актуальные настройки напрямую
    const settings = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getProviderSettings' }, resolve);
    });
    if (!settings.apiKey || !settings.model || !settings.provider) {
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!window.location.href.includes('web.telegram.org')) {
        return;
      }
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'getChatSummary' }, resolve);
      });
      if (!response || response.error) {
        if (response && response.needsApiKey) {
          setNeedsApiKey(true);
        }
        return;
      }
      if (response.success) {
        setSummary(response.summary);
        setCurrentChatId(response.chatId);
        setLastUpdate(new Date());
        setSuccess(`Резюме сгенерировано для ${response.messageCount} сообщений`);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySetup = async ({ apiKey, provider, model }) => {
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ 
          action: 'setProviderSettings', 
          settings: { apiKey, provider, model } 
        }, resolve);
      });
      
      if (response && response.success) {
        setApiKey(apiKey);
        setProvider(provider);
        setModel(model);
        setHasSettings(true);
        setNeedsApiKey(false);
        setSuccess('Настройки сохранены успешно!');
      } else {
        setError('Ошибка при сохранении настроек');
      }
    } catch (error) {
      setError('Ошибка при сохранении настроек: ' + error.message);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    window.close();
  };

  const saveToHistory = (summaryText, chatId, chatTitle) => {
    if (!summaryText || !chatId) return;
    
    const newItem = {
      id: Date.now(),
      summary: summaryText,
      chatId: chatId,
      chatTitle: chatTitle,
      timestamp: new Date().toISOString()
    };
    
    setHistory(prev => [newItem, ...prev]);
  };

  const deleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const copyHistoryItem = (summaryText) => {
    navigator.clipboard.writeText(summaryText).then(() => {
      setSuccess('Резюме скопировано в буфер обмена!');
    }).catch(() => {
      setError('Ошибка при копировании в буфер обмена');
    });
  };

  // Автоматическое сохранение в историю при генерации резюме
  useEffect(() => {
    if (summary && currentChatId && autoSaveHistory && lastUpdate) {
      const chatTitle = currentChatId;
      saveToHistory(summary, currentChatId, chatTitle + ' ' + lastUpdate.toLocaleTimeString());
    }
    // eslint-disable-next-line
  }, [summary]);

  // Экспорт истории в txt
  const exportHistory = () => {
    if (!history.length) return;
    const lines = history.map(item =>
      [
        `Чат: ${item.chatTitle}`,
        `Дата: ${new Date(item.timestamp).toLocaleString()}`,
        '',
        item.summary,
        '------------------------------'
      ].join('\n')
    ).join('\n\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-history-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Очищаем таймер при размонтировании
  useEffect(() => {
    return () => {
      if (chatChangeTimeout.current) {
        clearTimeout(chatChangeTimeout.current);
      }
    };
  }, []);

  return (
    <div className="grensa-window-root" style={{display:'flex',flexDirection:'column',width:600,height:520,minWidth:600,maxWidth:600,minHeight:520,maxHeight:520}}>
      <div className="grensa-window-header" style={{position:'relative',paddingRight:40}}>
        <div
          className="grensa-drag-header"
          style={{height:'100%',width: 'calc(100% - 36px)',position:'absolute',left:0,top:0,zIndex:1,cursor:'move'}}
          title="Переместить окно"
        ></div>
        <span style={{position:'relative',zIndex:2,marginLeft:12}}>Grensa.AI</span>
        <button
          className="grensa-window-close"
          onClick={e => { e.stopPropagation(); handleClose(); }}
          title="Закрыть"
          style={{position:'relative',zIndex:2,marginLeft:'auto'}}
        >×</button>
      </div>
      <div className="grensa-window-tabs" style={{display:'flex',gap:8,margin:'8px 0 0 0'}}>
        <button onClick={()=>setActiveTab('summary')} className={activeTab==='summary'?'grensa-tab-btn active-tab-btn':'grensa-tab-btn'}>
          Суммари
        </button>
        <button onClick={()=>setActiveTab('history')} className={activeTab==='history'?'grensa-tab-btn active-tab-btn':'grensa-tab-btn'}>
          История
        </button>
      </div>
      <div className="grensa-window-content" style={{flex:1,overflowY:'auto',padding:'24px 24px 16px 24px'}}>
        {activeTab === 'summary' && (
          <>
            <div className="auto-update-row">
              <input
                type="checkbox"
                id="auto-update"
                checked={autoUpdate}
                onChange={e => setAutoUpdate(e.target.checked)}
                disabled={!hasSettings || loading || autoUpdatePaused}
                className="grensa-checkbox"
              />
              <label htmlFor="auto-update" style={{ fontSize: 14 }}>
                Автоматически обновлять резюме при смене чата
              </label>
            </div>
            <div className="auto-save-history-row" style={{margin:'8px 0', display:'flex', alignItems: 'center', gap: '8px'}}>
              <input
                type="checkbox"
                id="auto-save-history"
                checked={autoSaveHistory}
                onChange={e => setAutoSaveHistory(e.target.checked)}
                disabled={loading}
                className="grensa-checkbox"
              />
              <label htmlFor="auto-save-history" style={{ fontSize: 14, marginRight: 8 }}>
                Автоматически сохранять в историю
              </label>
            </div>
            {!hasSettings && (
              <div className="grensa-window-error-message" style={{marginBottom:20}}>
                Введите API-ключ и модель в настройках расширения, чтобы использовать суммаризацию.
              </div>
            )}
            {loading && <LoadingSpinner />}
            <div style={{margin: '32px 0 0 0', textAlign: 'center', color: '#888', fontStyle: 'italic', fontSize: 16}}>
              {(!summary && !loading) && (
                <>
                  <div>
                    Нажмите <b>"Обновить резюме"</b> для анализа текущего чата<br/>
                    или перейдите в <b>настройки</b> для ввода API-ключа.
                  </div>
                </>
              )}
            </div>
            <div style={{display:'flex',gap:16,justifyContent:'center',marginTop:32}}>
              <button className="grensa-window-btn" onClick={generateSummary} disabled={loading || autoUpdatePaused}>
                Обновить резюме
              </button>
              <button className="grensa-window-btn" onClick={()=>chrome.runtime.sendMessage({ action: 'openOptionsPage' })}>
                Настройки
              </button>
            </div>
            {error && (
              hasSettings && (
                <div className="grensa-window-error-message">
                  {error}
                  <button className="grensa-window-btn" onClick={clearMessages}>
                    ✕
                  </button>
                </div>
              )
            )}
            {success && (
              <div className="grensa-window-success-message">
                {success}
                <button className="grensa-window-btn" onClick={clearMessages}>
                  ✕
                </button>
              </div>
            )}
            <Summary summary={summary} />
            <div className="grensa-window-status-bar">
              {currentChatId && (
                <div>Чат: {history.find(h=>h.chatId===currentChatId)?.chatTitle || currentChatId}</div>
              )}
              {lastUpdate && (
                <div>Обновлено: {lastUpdate.toLocaleTimeString()}</div>
              )}
            </div>
            <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
              <div style={{fontSize: 14, color: '#888'}}>
                {currentChatId
                  ? `Сохранить это резюме для чата: ${history.find(h=>h.chatId===currentChatId)?.chatTitle || currentChatId}`
                  : 'Невозможно сохранить: не определён чат'}
              </div>
              <button
                className="grensa-window-btn"
                disabled={loading || !summary || !currentChatId}
                onClick={()=>{
                  if (!summary) { setError('Нет сгенерированного резюме для сохранения!'); return; }
                  if (!currentChatId) { setError('Невозможно сохранить: не определён чат'); return; }
                  const chatTitle = history.find(h=>h.chatId===currentChatId)?.chatTitle || currentChatId || 'Неизвестный чат';
                  saveToHistory(summary, currentChatId, chatTitle + ' ' + (lastUpdate ? lastUpdate.toLocaleTimeString() : ''));
                  setSuccess('Суммари сохранено в историю!');
                }}
              >Сохранить</button>
            </div>
          </>
        )}
        {activeTab === 'history' && (
          <div className="grensa-history-tab">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <b>История суммари</b>
              <div style={{display:'flex',gap:8}}>
                <button className="grensa-window-btn" onClick={exportHistory} disabled={history.length===0}>Экспорт</button>
                <button className="grensa-window-btn" onClick={clearHistory} disabled={history.length===0}>Очистить историю</button>
              </div>
            </div>
            {history.length === 0 && <div style={{color:'#888',textAlign:'center',margin:'32px 0'}}>История пуста</div>}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {history.map(item => (
                <div key={item.id} className="grensa-history-card" style={{border:'1px solid #ccc',borderRadius:8,padding:12,background:'#fafbfc',position:'relative'}}>
                  <div style={{fontWeight:'bold',marginBottom:4}}>{item.chatTitle}</div>
                  <div style={{fontSize:12,color:'#888',marginBottom:8}}>{new Date(item.timestamp).toLocaleString()}</div>
                  <div style={{maxHeight:expandedHistoryId===item.id?'none':'48px',overflow:'hidden',whiteSpace:'pre-line',cursor:'pointer'}} onClick={()=>setExpandedHistoryId(expandedHistoryId===item.id?null:item.id)}>
                    {expandedHistoryId===item.id ? (
                      <ReactMarkdown>{item.summary}</ReactMarkdown>
                    ) : (
                      item.summary.length>120 ? item.summary.slice(0,120)+'...' : item.summary
                    )}
                  </div>
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className="grensa-window-btn" onClick={()=>copyHistoryItem(item.summary)}>Копировать</button>
                    <button className="grensa-window-btn" onClick={()=>deleteHistoryItem(item.id)}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
