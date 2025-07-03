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
