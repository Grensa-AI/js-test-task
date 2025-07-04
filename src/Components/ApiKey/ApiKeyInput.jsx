import { useEffect, useState } from 'react'

export const ApiKeyInput = () => {
	const [apiKey, setApiKey] = useState('')

	useEffect(() => {
		const savedKey = localStorage.getItem('openai_api_key')
		if (savedKey) {
			setApiKey(savedKey)
		}
	}, [])

	const handleSave = () => {
		localStorage.setItem('openai_api_key', apiKey)
		alert('API ключ сохранён')
	}

	return (
		<div style={{ marginBottom: '1rem' }}>
			<h4>🔑 OpenAI API Key</h4>
			<input
				type='password'
				value={apiKey}
				onChange={e => setApiKey(e.target.value)}
				placeholder='sk-...'
				style={{
					width: '100%',
					padding: '0.5rem',
					marginBottom: '0.5rem',
					borderRadius: '4px',
				}}
			/>
			<button onClick={handleSave}>💾 Сохранить ключ</button>
		</div>
	)
}
