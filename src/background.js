import { getSummary } from "./background/openai";

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes("web.telegram.org")) {
    chrome.tabs.sendMessage(tab.id, { action: "toggle" });
  }

});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "get_summary") {
    getSummary(message.chatInfo, sendResponse);
    return true;
  }
})
