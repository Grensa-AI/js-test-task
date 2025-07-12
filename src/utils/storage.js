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
    console.error('Error loading settings:', error);
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
    
    console.log('Settings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const clearSettings = async () => {
  try {
    // Try to clear from Chrome storage
    if (chrome && chrome.storage && chrome.storage.sync) {
      await chrome.storage.sync.remove(STORAGE_KEYS.SETTINGS);
    } else {
      // Fallback to localStorage for development
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    }
    
    console.log('Settings cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing settings:', error);
    throw error;
  }
};

// Listen for storage changes
export const onSettingsChange = (callback) => {
  try {
    if (chrome && chrome.storage && chrome.storage.onChanged) {
      const listener = (changes, namespace) => {
        if (namespace === 'sync' && changes[STORAGE_KEYS.SETTINGS]) {
          const newSettings = changes[STORAGE_KEYS.SETTINGS].newValue;
          callback(newSettings || DEFAULT_SETTINGS);
        }
      };
      
      chrome.storage.onChanged.addListener(listener);
      
      // Return cleanup function
      return () => {
        chrome.storage.onChanged.removeListener(listener);
      };
    }
  } catch (error) {
    console.error('Error setting up storage listener:', error);
  }
  
  return () => {}; // No-op cleanup for fallback
}; 