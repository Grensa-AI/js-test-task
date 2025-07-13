// Chrome storage utilities for extension settings

const STORAGE_KEYS = {
  SETTINGS: 'telegram_extension_settings'
};

const DEFAULT_SETTINGS = {
  apiKey: '',
  provider: 'openai', // Default to OpenAI
  debugMode: false
};

export const loadSettings = async () => {
  try {
    // Try to load from Chrome storage
    if (chrome && chrome.storage && chrome.storage.sync) {
      const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      const settings = result[STORAGE_KEYS.SETTINGS];
      
      if (settings) {
        return { ...DEFAULT_SETTINGS, ...settings };
      }
    }
    
    // Fallback to localStorage for development
    const localSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (localSettings) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localSettings) };
    }
    
    return DEFAULT_SETTINGS;
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings) => {
  try {
    const settingsToSave = { ...DEFAULT_SETTINGS, ...settings };
    
    // Try to save to Chrome storage
    if (chrome && chrome.storage && chrome.storage.sync) {
      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: settingsToSave
      });
    } else {
      // Fallback to localStorage for development
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsToSave));
    }
    

    return true;
  } catch (error) {
    throw error;
  }
}; 