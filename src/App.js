import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { extractChat } from './extractChat'

const AppContainer = styled.div`
    width: 400px;
    max-height: 500px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    padding: 20px;
    overflow-y: auto;
    color: #111827;
`

const Button = styled.button`
    padding: 8px 12px;
    background: #6366f1;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    &:disabled { opacity: 0.6; cursor: default; }
`

const Input = styled.input`
    width: calc(100% - 12px);
    padding: 6px;
    margin-bottom: 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
`

export default function App() {
    const [apiKey, setApiKey] = useState('')
    const [summary, setSummary] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        // 1) Попытаться прочитать из chrome.storage (extension)
        if (
            window.chrome &&
            chrome.storage &&
            chrome.storage.local &&
            process.env.NODE_ENV !== 'development'
        ) {
            chrome.storage.local.get('openaiKey', ({ openaiKey }) => {
                if (openaiKey) setApiKey(openaiKey)
            })
        } else {
            // 2) Фоллбэк на localStorage (dev / localhost)
            const saved = localStorage.getItem('openaiKey')
            if (saved) setApiKey(saved)
        }
    }, [])

    const saveKey = () => {
        if (window.chrome && chrome.storage && chrome.storage.local && process.env.NODE_ENV !== 'development') {
            chrome.storage.local.set({ openaiKey: apiKey }, () =>
                alert('API-ключ сохранён в chrome.storage')
            )
        } else {
            localStorage.setItem('openaiKey', apiKey)
            alert('API-ключ сохранён в localStorage')
        }
    }

    const generateSummary = async () => {
        setError('')
        setLoading(true)

        // mock в dev
        if (process.env.NODE_ENV === 'development') {
            await new Promise(r => setTimeout(r,500))
            setSummary('Это тестовое резюме чата (mock).')
            setLoading(false)
            return
        }

        try {
            const chat = extractChat()
            if (!chat) throw new Error('Не найдено сообщений в чате')

            const res = await fetch(
                'https://api.openai.com/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey.trim()}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: 'Ты ассистент, который резюмирует чат.' },
                            { role: 'user', content: `Резюме переписки:\n\n${chat}` },
                        ],
                        max_tokens: 200,
                    }),
                }
            )
            const { choices, error: apiError } = await res.json()
            if (apiError) throw new Error(apiError.message)
            setSummary(choices[0].message.content.trim())
        } catch (e) {
            console.error(e)
            if (e.message.toLowerCase().includes('quota')) {
                setError('Квота исчерпана. Пополните счёт в личном кабинете OpenAI.')
            } else if (e.message.toLowerCase().includes('incorrect api key')) {
                setError('Неверный API-ключ. Перепроверьте его и сохраните заново.')
            } else {
                setError(e.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <AppContainer>
            <Input
                type="password"
                placeholder="Введите OpenAI API-ключ"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
            />
            <Button onClick={saveKey} disabled={!apiKey}>
                Сохранить ключ
            </Button>
            <Button
                onClick={generateSummary}
                disabled={loading || !apiKey}
                style={{ marginTop: 8 }}
            >
                {loading ? 'Генерация…' : 'Сгенерировать резюме'}
            </Button>
            {error && <p style={{ color:'red' }}>{error}</p>}
            <div style={{ marginTop:12 }}>
                {summary || 'Нажмите кнопку, чтобы получить резюме'}
            </div>
        </AppContainer>
    )
}
