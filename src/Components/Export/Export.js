import React, { useState } from 'react';
import './Export.css';

const Export = ({ summary, historyItem }) => {
  const [exportFormat, setExportFormat] = useState('txt');
  const [exporting, setExporting] = useState(false);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateFileName = (format) => {
    const timestamp = historyItem ? historyItem.timestamp : Date.now();
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    let extension = format;
    if (format === 'markdown') extension = 'md';
    if (format === 'json') extension = 'json';
    
    return `grensa-summary-${dateStr}-${timeStr}.${extension}`;
  };

  const exportAsText = (content) => {
    const header = historyItem 
      ? `Резюме чата Telegram\nСгенерировано: ${formatDate(historyItem.timestamp)}\nСообщений: ${historyItem.messageCount}\n\n`
      : `Резюме чата Telegram\nСгенерировано: ${formatDate(Date.now())}\n\n`;
    
    return header + content;
  };

  const exportAsMarkdown = (content) => {
    const header = historyItem 
      ? `# Резюме чата Telegram\n\n**Дата:** ${formatDate(historyItem.timestamp)}  \n**Сообщений:** ${historyItem.messageCount}\n\n---\n\n`
      : `# Резюме чата Telegram\n\n**Дата:** ${formatDate(Date.now())}\n\n---\n\n`;
    
    return header + content;
  };

  const exportAsJson = (content) => {
    const data = {
      summary: content,
      metadata: {
        generatedAt: historyItem ? historyItem.timestamp : Date.now(),
        messageCount: historyItem ? historyItem.messageCount : null,
        chatId: historyItem ? historyItem.chatId : null,
        exportFormat: 'json',
        exportedAt: Date.now()
      }
    };
    
    return JSON.stringify(data, null, 2);
  };

  const exportAsHtml = (content) => {
    const header = historyItem 
      ? `<h1>Резюме чата Telegram</h1><p><strong>Дата:</strong> ${formatDate(historyItem.timestamp)}</p><p><strong>Сообщений:</strong> ${historyItem.messageCount}</p><hr>`
      : `<h1>Резюме чата Telegram</h1><p><strong>Дата:</strong> ${formatDate(Date.now())}</p><hr>`;
    
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Резюме чата Telegram</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #6366f1; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
        .summary { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .metadata { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    ${header}
    <div class="summary">${content.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
  };

  const handleExport = async () => {
    if (!summary) {
      alert('Нет резюме для экспорта');
      return;
    }

    setExporting(true);
    
    try {
      let content = '';
      let mimeType = '';
      
      switch (exportFormat) {
        case 'txt':
          content = exportAsText(summary);
          mimeType = 'text/plain';
          break;
        case 'markdown':
          content = exportAsMarkdown(summary);
          mimeType = 'text/markdown';
          break;
        case 'json':
          content = exportAsJson(summary);
          mimeType = 'application/json';
          break;
        case 'html':
          content = exportAsHtml(summary);
          mimeType = 'text/html';
          break;
        default:
          content = exportAsText(summary);
          mimeType = 'text/plain';
      }

      const fileName = generateFileName(exportFormat);
      const blob = new Blob([content], { type: mimeType });
      
      // Создаем ссылку для скачивания
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Ошибка при экспорте файла');
    } finally {
      setExporting(false);
    }
  };

  const exportAllHistory = async () => {
    setExporting(true);
    
    try {
      const result = await chrome.storage.local.get(['summaryHistory']);
      const history = result.summaryHistory || [];
      
      if (history.length === 0) {
        alert('История резюме пуста');
        return;
      }

      const data = {
        exportedAt: Date.now(),
        totalSummaries: history.length,
        summaries: history.map(item => ({
          id: item.id,
          chatId: item.chatId,
          summary: item.summary,
          messageCount: item.messageCount,
          timestamp: item.timestamp,
          date: item.date
        }))
      };

      const content = JSON.stringify(data, null, 2);
      const fileName = `grensa-all-summaries-${new Date().toISOString().split('T')[0]}.json`;
      const blob = new Blob([content], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Ошибка экспорта истории:', error);
      alert('Ошибка при экспорте истории');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grensa-export-container">
      <div className="grensa-export-header">
        <h3 className="grensa-export-title">Экспорт резюме</h3>
      </div>
      
      <div className="grensa-export-content">
        <div className="grensa-export-format-selector">
          <label className="grensa-export-label">Формат файла:</label>
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value)}
            className="grensa-export-select"
          >
            <option value="txt">Текстовый файл (.txt)</option>
            <option value="markdown">Markdown (.md)</option>
            <option value="html">HTML (.html)</option>
            <option value="json">JSON (.json)</option>
          </select>
        </div>
        
        <div className="grensa-export-actions">
          <button 
            onClick={handleExport}
            disabled={!summary || exporting}
            className="grensa-export-btn grensa-export-primary"
          >
            {exporting ? 'Экспорт...' : 'Экспортировать текущее резюме'}
          </button>
          
          <button 
            onClick={exportAllHistory}
            disabled={exporting}
            className="grensa-export-btn grensa-export-secondary"
          >
            {exporting ? 'Экспорт...' : 'Экспортировать всю историю'}
          </button>
        </div>
        
        <div className="grensa-export-info">
          <div className="grensa-export-info-item">
            <span className="grensa-export-info-icon">📄</span>
            <span>Текущее резюме будет сохранено в выбранном формате</span>
          </div>
          <div className="grensa-export-info-item">
            <span className="grensa-export-info-icon">📚</span>
            <span>Вся история экспортируется в JSON формате</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export; 