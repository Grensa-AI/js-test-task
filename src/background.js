import { getSummary } from "./background/openai";

// When the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes("web.telegram.org")) {
    // Send message to content script to show the widget
    chrome.tabs.sendMessage(tab.id, "show-widget");
  }
});

// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "get_summary") {
    // Call getSummary with provided chatInfo and forceRefresh flag
    getSummary(message.chatInfo, sendResponse, message.forceRefresh);
    // Return true to indicate sendResponse will be called asynchronously
    return true;
  }
});
