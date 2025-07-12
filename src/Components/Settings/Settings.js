import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  max-width: none;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.3px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }

  &.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Message = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  margin-top: 8px;
  border: 1px solid;

  &.success {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.2);
  }

  &.error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);
  }

  &.info {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    border-color: rgba(59, 130, 246, 0.2);
  }

  &.warning {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border-color: rgba(245, 158, 11, 0.2);
  }
`;

const Link = styled.a`
  color: #6366f1;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
    color: #8b5cf6;
  }
`;

const Instructions = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  backdrop-filter: blur(10px);
`;

const AlternativeMethods = styled.div`
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 12px;
  padding: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  backdrop-filter: blur(10px);
  margin-top: 12px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: none;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &.danger {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
    color: #ef4444;

    &:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
    }
  }
`;

const MethodTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #f59e0b;
  font-size: 14px;
  font-weight: 600;
`;

export const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const result = await chrome.storage.local.get(['openaiApiKey']);
      if (result.openaiApiKey) {
        setApiKey(result.openaiApiKey);
      }
    } catch (error) {
      console.error('Ошибка при загрузке API ключа:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await chrome.storage.local.set({ openaiApiKey: apiKey });
      
      setMessage({ 
        type: "success", 
        text: "API ключ успешно сохранен!" 
      });

      chrome.runtime.sendMessage({ 
        action: 'api_key_updated' 
      });

    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "Ошибка при сохранении API ключа" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setMessage({ 
        type: "error", 
        text: "Введите API ключ для проверки" 
      });
      return;
    }

    setIsValidating(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: "API ключ валиден!" 
        });
      } else {
        setMessage({ 
          type: "error", 
          text: "Неверный API ключ. Проверьте правильность ввода." 
        });
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "Ошибка при проверке API ключа. Проверьте подключение к интернету." 
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = async () => {
    try {
      await chrome.storage.local.remove(['openaiApiKey']);
      setApiKey("");
      setMessage({ 
        type: "success", 
        text: "API ключ удален" 
      });
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "Ошибка при удалении API ключа" 
      });
    }
  };

  return (
    <Container>
      <Title>Настройки OpenAI API</Title>
      
      <Instructions>
        <strong>Как получить API ключ:</strong>
        <br />
        1. Перейдите на <Link href="https://platform.openai.com/" target="_blank">platform.openai.com</Link>
        <br />
        2. Создайте аккаунт или войдите в существующий
        <br />
        3. Перейдите в раздел "API Keys"
        <br />
        4. Нажмите "Create new secret key"
        <br />
        5. Скопируйте и вставьте ключ ниже
      </Instructions>

      <AlternativeMethods>
        <MethodTitle>🔧 Альтернативные способы получения ключа:</MethodTitle>
        <strong>Если сайт заблокирован:</strong>
        <br />
        • Используйте VPN для доступа к platform.openai.com
        <br />
        • Попробуйте альтернативные домены (api.openai.com)
        <br />
        • Обратитесь к администратору сети
        <br />
        • Используйте мобильное приложение OpenAI
        <br />
        <br />
        <strong>Другие варианты:</strong>
        <br />
        • Купите ключ у официальных партнеров
        <br />
        • Используйте корпоративные аккаунты
        <br />
        • Обратитесь в поддержку OpenAI
      </AlternativeMethods>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="apiKey">OpenAI API Ключ</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className={message.type === "error" ? "error" : ""}
            required
          />
        </FormGroup>

        <ButtonGroup>
          <SecondaryButton 
            type="button" 
            onClick={handleValidate}
            disabled={isValidating || !apiKey.trim()}
            style={{ flex: 1 }}
          >
            {isValidating ? "Проверяем..." : "Проверить"}
          </SecondaryButton>
          
          <SecondaryButton 
            type="button" 
            onClick={handleClear}
            disabled={isLoading}
            className="danger"
          >
            Очистить
          </SecondaryButton>
        </ButtonGroup>

        <Button 
          type="submit" 
          disabled={isLoading || !apiKey.trim()}
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </Form>

      {message.text && (
        <Message className={message.type}>
          {message.text}
        </Message>
      )}
    </Container>
  );
}; 