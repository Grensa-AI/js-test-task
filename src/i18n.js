import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // App component
      loading: "Loading...",
      settings: "Settings",
      history: "History",
      messages: "messages",
      cached: "cached",
      words: "words",
      limitedView: "Limited view",
      debugMode: "DEBUG MODE",
      
      // Settings component
      settingsTitle: "Settings",
      aiProvider: "AI Provider",
      selectProvider: "Select AI provider for summary generation",
      apiKey: "API Key",
      getApiKey: "Get API key at",
      debugModeLabel: "Debug Mode",
      enableDebugMode: "Enable debug mode for development",
      saveSettings: "Save Settings",
      clearSettings: "Clear",
      settingsSaved: "Settings saved!",
      settingsError: "Error saving settings",
      cacheStatistics: "Cache Statistics",
      totalEntries: "Total entries",
      totalSize: "Total size",
      clearCache: "Clear Cache",
      clearingCache: "Clearing...",
      cacheCleared: "Cache cleared!",
      cacheClearError: "Error clearing cache",
      
      // Summary component
      summary: "Summary",
      debug: "Debug",
      refresh: "Refresh",
      clearCache: "Clear Cache",
      clearing: "Clearing...",
      changeContext: "Change Context",
      loadedFromCache: "Loaded from cache",
      summaryFor: "Summary created for {{count}} messages out of {{total}} available",
      
      // Context Selector component
      selectContext: "Select Context",
      selectMessagesForSummary: "Select messages for summary generation",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      collectingMessages: "Collecting messages... {{current}}{{total}}",
      collectMore: "Collect More Messages",
      collecting: "Collecting...",
      createSummary: "Create Summary ({{count}} messages)",
      andMore: "... and {{count}} more messages",
      participant: "Participant",
      me: "Me",
      last10: "Last 10",
      last25: "Last 25",
      last50: "Last 50",
      incomingOnly: "Incoming Only",
      outgoingOnly: "Outgoing Only",
      totalMessages: "Total Messages",
      totalWords: "Total Words",
      incoming: "Incoming",
      outgoing: "Outgoing",
      rangeStart: "Range start: message {{number}}",
      rangeEnd: "Range end: message {{number}}",
      selectedMessages: "Selected Messages",
      wordsInSelection: "Words in Selection",
      
      // Title component
      appTitle: "Grensa.AI",
      
      // Error messages
      noApiKey: "Please set your API key in settings",
      noMessages: "No messages to summarize",
      summaryError: "Error generating summary",
      
      // Status messages
      generating: "Generating summary...",
      generatingWithCount: "Generating summary for {{count}} messages...",
    }
  },
  ru: {
    translation: {
      // App component
      loading: "Загрузка...",
      settings: "⚙️ Настройки",
      history: "📚 История",
      messages: "сообщений",
      cached: "в кэше",
      words: "слов",
      limitedView: "Ограниченный просмотр",
      debugMode: "РЕЖИМ ОТЛАДКИ",
      
      // Settings component
      settingsTitle: "Настройки",
      aiProvider: "AI Провайдер",
      selectProvider: "Выберите провайдера AI для резюме",
      apiKey: "API Key",
      getApiKey: "Получите API ключ на",
      debugModeLabel: "Режим отладки",
      enableDebugMode: "Включить режим отладки для разработки",
      saveSettings: "Сохранить настройки",
      clearSettings: "Очистить",
      settingsSaved: "Настройки сохранены!",
      settingsError: "Ошибка при сохранении настроек",
      cacheStatistics: "Статистика кэша",
      totalEntries: "Всего записей",
      totalSize: "Общий размер",
      clearCache: "Очистить кэш",
      clearingCache: "Очистка...",
      cacheCleared: "Кэш очищен!",
      cacheClearError: "Ошибка при очистке кэша",
      
      // Summary component
      summary: "Резюме",
      debug: "Отладка",
      refresh: "Обновить",
      clearCache: "Очистить кэш",
      clearing: "Очистка...",
      changeContext: "Изменить контекст",
      loadedFromCache: "Загружено из кэша",
      summaryFor: "Резюме создано для {{count}} сообщений из {{total}} доступных",
      
      // Context Selector component
      selectContext: "Выбор контекста",
      selectMessagesForSummary: "Выберите сообщения для резюме",
      selectAll: "Выбрать все",
      deselectAll: "Отменить выбор",
      collectingMessages: "Собираем сообщения... {{current}}{{total}}",
      collectMore: "Собрать ещё",
      collecting: "Собираем...",
      createSummary: "Создать резюме ({{count}} сообщений)",
      andMore: "... и ещё {{count}} сообщений",
      participant: "Собеседник",
      me: "Я",
      last10: "Последние 10",
      last25: "Последние 25",
      last50: "Последние 50",
      incomingOnly: "Входящие",
      outgoingOnly: "Исходящие",
      totalMessages: "Всего сообщений",
      totalWords: "Всего слов",
      incoming: "Входящие",
      outgoing: "Исходящие",
      rangeStart: "Начало диапазона: сообщение {{number}}",
      rangeEnd: "Конец диапазона: сообщение {{number}}",
      selectedMessages: "Выбрано сообщений",
      wordsInSelection: "Слов в выборке",
      
      // Title component
      appTitle: "Grensa.AI",
      
      // Error messages
      noApiKey: "Пожалуйста, установите API ключ в настройках",
      noMessages: "Нет сообщений для резюме",
      summaryError: "Ошибка при генерации резюме",
      
      // Status messages
      generating: "Генерация резюме...",
      generatingWithCount: "Генерация резюме для {{count}} сообщений...",
    }
  }
};

// Initialize i18n synchronously
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true, // Enable debug to see what's happening
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    }
  });

console.log('i18n initialized, instance:', i18n);
console.log('i18n.changeLanguage:', typeof i18n.changeLanguage);

export default i18n; 