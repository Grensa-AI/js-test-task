/**
 * Summary.js - Компонент для отображения резюме чата в расширении Grensa.AI
 * 
 * Этот компонент показывает результат анализа чата - краткое содержание
 * всех сообщений, которые ИИ прочитал и понял.
 * 
 * Что здесь происходит:
 * 1. Показывает текст резюме в красивом блоке
 * 2. Если резюме еще нет, показывает сообщение "Резюме не найдено"
 * 3. Если есть ошибка, показывает красное сообщение об ошибке
 * 4. Если идет загрузка, показывает спиннер
 * 5. Позволяет скопировать резюме в буфер обмена
 * 6. Позволяет сохранить резюме в историю
 * 
 * Это как экран телевизора - здесь пользователь видит результат работы
 * ИИ. Если ИИ хорошо проанализировал чат, здесь будет понятное краткое
 * содержание всех важных моментов разговора.
 * 
 * Компонент автоматически обновляется когда приходит новый результат
 * от background.js.
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';

function Summary({ summary }) {
  return (
    <div className="grensa-window-summary-container">
      <div className="grensa-window-summary-header">Резюме чата</div>
      <div className="grensa-window-summary-markdown">
        {summary ? (
          <ReactMarkdown>{summary}</ReactMarkdown>
        ) : (
          <div className="grensa-window-summary-placeholder">
            Нажмите "Обновить резюме" для анализа текущего чата
          </div>
        )}
      </div>
    </div>
  );
}

export default Summary;
