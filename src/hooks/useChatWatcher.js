import { useEffect, useRef } from 'react'

export const useChatWatcher = (onChatChange) => {
	const lastHash = useRef(location.hash)

	useEffect(() => {
		const interval = setInterval(() => {
			if (location.hash !== lastHash.current) {
				console.log('Hash изменился:', location.hash)
				lastHash.current = location.hash
				onChatChange()
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [onChatChange])
}