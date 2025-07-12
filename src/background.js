// Background script для расширения Grensa.AI

// Обработка клика по иконке расширения
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes("web.telegram.org")) {
    // Отправляем сообщение в content script для показа/скрытия расширения
    chrome.tabs.sendMessage(tab.id, { action: "toggle" });
  } else {
    // Если не на Telegram Web, показываем уведомление
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.svg',
      title: 'Grensa.AI',
      message: 'Расширение работает только на web.telegram.org'
    });
  }
});

// Обработка сообщений от content script и popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background получил сообщение:', message);

  switch (message.action) {
    case 'open_settings':
      // Открываем popup с настройками
      chrome.action.setPopup({ popup: 'index.html' });
      break;
      
    case 'api_key_updated':
      // Пересылаем сообщение в активную вкладку
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url?.includes('web.telegram.org')) {
          chrome.tabs.sendMessage(tabs[0].id, message);
        }
      });
      break;
      
    default:
      // Пересылаем сообщения в popup
      chrome.runtime.sendMessage(message);
      break;
  }
});

// Обработка установки расширения
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Расширение Grensa.AI установлено');
    
    // Показываем приветственное уведомление
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.svg',
      title: 'Grensa.AI установлено!',
      message: 'Откройте Telegram Web и нажмите на иконку расширения для начала работы'
    });
  }
});
