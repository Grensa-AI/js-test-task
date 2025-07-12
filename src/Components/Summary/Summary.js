import React, { useState, useEffect } from "react"
import styled from "styled-components"

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

const Loader = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

export const Summary = ({ onGenerateSummary }) => {
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastGenerated, setLastGenerated] = useState(null)

  useEffect(() => {
    const fetchSummary = async () => {
      if (isLoading) return

      setIsLoading(true)
      setError(null)
      try {
        const result = await onGenerateSummary()
        setSummary(result)
        setLastGenerated(Date.now())
      } catch (err) {
        setError("Ошибка при генерации резюме")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    // обновляем резюме только если прошло больше 10 секунд с последнего запроса
    if (!lastGenerated || Date.now() - lastGenerated > 10000) {
      fetchSummary()
    }
  }, [onGenerateSummary])

  return (
    <Container>
      <SummaryTitle>Резюме</SummaryTitle>
      {isLoading ? <Loader /> : error ? <Text style={{ color: "#ef4444" }}>{error}</Text> : <Text>{summary || "Не удалось загрузить резюме"}</Text>}
    </Container>
  )
}
