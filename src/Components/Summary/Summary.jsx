import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { extractMessages } from '../../content'
import { getSummary } from '../../openai'

const Container = styled.div`
	padding: 16px;
	background: #f8f9fa;
	border-radius: 8px;
	border-left: 4px solid #6366f1;
`

const SummaryTitle = styled.h3`
	margin: 0 0 12px 0;
	color: #111827;
	font-size: 16px;
	font-weight: 600;
`

const Text = styled.p`
	margin: 0;
	color: #6b7280;
	font-size: 14px;
	line-height: 1.5;
`

const Button = styled.button`
	margin-top: 12px;
	padding: 6px 12px;
	background-color: #6366f1;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
`

export const Summary = () => {
	const [summary, setSummary] = useState('')
	const [loading, setLoading] = useState(false)
	const [apiKey, setApiKey] = useState('')
	const [error, setError] = useState('')

	useEffect(() => {
		const key = localStorage.getItem('openai_api_key')
		console.log('📦 localStorage ключ:', key)
		if (key) {
			setApiKey(key)
		}
	}, [])

	const handleGenerate = async () => {
		setLoading(true)
		setError('')
		setSummary('')

		if (!apiKey) {
			setError('API ключ не найден.')
			setLoading(false)
			return
		}

		const messages = extractMessages().slice(-20)
		if (!messages.length) {
			setError('Нет доступных сообщений для анализа.')
			setLoading(false)
			return
		}

		// const result = await getSummary(messages.join('\n'), apiKey)
		// setSummary(result)

		await new Promise(res => setTimeout(res, 1000))
		setSummary(
			'Это пример резюме: участники обсудили текущие задачи, отметили прогресс и наметили план на завтра. (Платный OpenAI API-ключ)'
		)

		setLoading(false)
	}

	return (
		<Container>
			<SummaryTitle>Резюме</SummaryTitle>
			{error && <Text style={{ color: 'red' }}>{error}</Text>}
			{loading ? (
				<Text>Генерация...</Text>
			) : summary ? (
				<Text>{summary}</Text>
			) : (
				<Text>Нажмите кнопку ниже для генерации резюме.</Text>
			)}
			<Button onClick={handleGenerate} disabled={loading}>
				Сгенерировать
			</Button>
		</Container>
	)
}
