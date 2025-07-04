
import React, { useState } from 'react';
import styled from 'styled-components';

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'gemini', label: 'Gemini (Google)' },
];

const MODELS = {
  openai: [
    { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
    { value: 'gpt-4', label: 'gpt-4' },
  ],
  openrouter: [
    { value: 'openai/gpt-3.5-turbo', label: 'openai/gpt-3.5-turbo' },
    { value: 'google/gemini-pro', label: 'google/gemini-pro' },
    { value: 'anthropic/claude-3-opus', label: 'anthropic/claude-3-opus' },
  ],
  gemini: [
    { value: 'gemini-pro', label: 'gemini-pro' },
    { value: 'gemini-pro-vision', label: 'gemini-pro-vision' },
  ],
};

const SetupContainer = styled.div`
  margin: 20px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  margin: 10px 0;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 20px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Description = styled.div`
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  opacity: 0.9;
`;

const Link = styled.a`
  color: #74b9ff;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HelpText = styled.div`
  font-size: 12px;
  opacity: 0.7;
  margin-top: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  margin: 10px 0;
  font-size: 14px;
`;

function ApiKeySetup({ onSubmit, loading }) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState(MODELS['openai'][0].value);

  const handleProviderChange = (e) => {
    setProvider(e.target.value);
    setModel(MODELS[e.target.value][0].value);
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit({ apiKey: apiKey.trim(), provider, model });
    }
  };

  return (
    <SetupContainer>
      <Description>
        Для работы расширения необходим API ключ и выбор провайдера. 
        <br />
        <Link href="https://platform.openai.com/api-keys" target="_blank">Получить OpenAI ключ →</Link>
        <br />
        <Link href="https://openrouter.ai/keys" target="_blank">Получить OpenRouter ключ →</Link>
        <br />
        <Link href="https://aistudio.google.com/app/apikey" target="_blank">Получить Gemini ключ →</Link>
      </Description>
      <form onSubmit={handleSubmit}>
        <Select value={provider} onChange={handleProviderChange} disabled={loading}>
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
        <Input
          type="text"
          placeholder="Введите название модели (например, gpt-3.5-turbo)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="Введите ваш API ключ"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !apiKey.trim() || !model.trim()}>
          {loading ? 'Проверка...' : 'Сохранить ключ'}
        </Button>
      </form>
      <HelpText>
        🔒 Ключ используется только в памяти расширения и не сохраняется в браузере. Настройки провайдера и модели сохраняются локально.
      </HelpText>
    </SetupContainer>
  );
}

export default ApiKeySetup;
