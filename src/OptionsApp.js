import React, { useState, useEffect } from 'react';
import './styles/options.css';
import Title from './Components/Title/Title';

const PROVIDERS = [
  { key: 'openai', label: 'OpenAI' },
  { key: 'openrouter', label: 'OpenRouter' },
  { key: 'gemini', label: 'Gemini (Google)' },
];

const getDefaultModel = (provider) => {
  switch (provider) {
    case 'openai': return 'gpt-3.5-turbo';
    case 'openrouter': return 'openrouter/auto';
    case 'gemini': return 'gemini-2.5-flash';
    default: return '';
  }
};

const OptionsApp = () => {
  const [activeTab, setActiveTab] = useState('provider');
  const [activeProvider, setActiveProvider] = useState(PROVIDERS[0].key);
  const [models, setModels] = useState({});
  const [apiKeys, setApiKeys] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [providerToSave, setProviderToSave] = useState(PROVIDERS[0].key);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['models', 'activeProvider'], (result) => {
      setModels(result.models || {});
      if (result.activeProvider) {
        setActiveProvider(result.activeProvider);
        setProviderToSave(result.activeProvider);
      }
    });
    chrome.storage.session.get(['apiKeys'], (result) => {
      setApiKeys(result.apiKeys || {});
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ models });
  }, [models]);

  useEffect(() => {
    chrome.storage.session.set({ apiKeys });
  }, [apiKeys]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleModelChange = (e) => {
    setModels({ ...models, [activeTab]: e.target.value });
  };

  const handleKeyChange = (e) => {
    setApiKeys({ ...apiKeys, [activeTab]: e.target.value });
  };

  const handleProviderSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    chrome.storage.local.set({ activeProvider: providerToSave }, () => {
      setActiveProvider(providerToSave);
      setLoading(false);
      setSuccess('Провайдер сохранён!');
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const newModels = { ...models, [activeTab]: models[activeTab] || getDefaultModel(activeTab) };
    setModels(newModels);
    chrome.storage.local.set({ models: newModels }, () => {
      const apiKey = apiKeys[activeTab] || '';
      const provider = activeTab;
      const model = newModels[activeTab];
      chrome.storage.session.set({ apiKeys }, () => {
        chrome.runtime.sendMessage({ action: 'saveApiKey', apiKey, provider, model }, (resp) => {
          setLoading(false);
          if (resp && resp.success) {
            setSuccess('Настройки сохранены!');
          } else {
            setError('Ошибка сохранения ключа.');
          }
        });
      });
    });
  };

  return (
    <div className="options-fullscreen">
      <div className="options-tabs">
        <button
          className={`options-tab${activeTab === 'provider' ? ' active' : ''}`}
          onClick={() => setActiveTab('provider')}
        >
          Провайдер
        </button>
        {PROVIDERS.map((prov) => (
          <button
            key={prov.key}
            className={`options-tab${activeTab === prov.key ? ' active' : ''}`}
            onClick={() => setActiveTab(prov.key)}
          >
            {prov.label}
          </button>
        ))}
      </div>
      <div className="options-content">
        <Title />
        {activeTab === 'provider' && (
          <div className="options-block">
            <label style={{ fontWeight: 'bold', marginBottom: 4 }}>Выберите активного провайдера</label>
            <select
              value={providerToSave}
              onChange={e => setProviderToSave(e.target.value)}
              className="options-input"
              style={{ maxWidth: 320, marginBottom: 16 }}
            >
              {PROVIDERS.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
            <button className="options-save-btn" onClick={handleProviderSave} disabled={loading}>
              {loading ? 'Сохраняю...' : 'Сохранить'}
            </button>
            {success && <div className="options-success">{success}</div>}
            {error && <div className="options-error">{error}</div>}
            <div style={{ fontSize: 15, color: '#fff', marginTop: 12, fontWeight: 600, textShadow: '0 1px 4px #764ba2' }}>
              <b>Текущий выбранный провайдер:</b> {PROVIDERS.find(p => p.key === activeProvider)?.label}
            </div>
            <div className="options-hint" style={{ marginTop: 12 }}>
              Для работы расширения выберите провайдера, затем настройте ключ и модель на соответствующей вкладке.
            </div>
          </div>
        )}
        {activeTab !== 'provider' && (
          <>
            <div className="options-block">
              <label>Модель</label>
              <input
                type="text"
                value={models[activeTab] || getDefaultModel(activeTab)}
                onChange={handleModelChange}
                className="options-input"
                placeholder="Введите модель (например, gpt-3.5-turbo)"
              />
            </div>
            <div className="options-block">
              <label>API-ключ</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeys[activeTab] || ''}
                  onChange={handleKeyChange}
                  className="options-input"
                  placeholder="Введите API-ключ"
                  style={{ flex: 1, paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    outline: 'none',
                    fontSize: 20,
                    color: showApiKey ? '#764ba2' : '#888',
                  }}
                  tabIndex={-1}
                  aria-label={showApiKey ? 'Скрыть ключ' : 'Показать ключ'}
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button className="options-save-btn" onClick={handleSave} disabled={loading}>
              {loading ? 'Сохраняю...' : 'Сохранить'}
            </button>
            {success && <div className="options-success">{success}</div>}
            {error && <div className="options-error">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default OptionsApp; 