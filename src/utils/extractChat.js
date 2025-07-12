export default async function extractChat(attempts = 0, maxAttempts = 10) {
  console.log("Trying to extract messages");
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (attempts < maxAttempts) {
    if (isTelegramLoaded()) {
      await delay(1000); // Wait for messages to load
      return {
        members: extractChatMembers(),
        messages: extractMessages(),
        type: isGroupChat() ? "group" : "personal",
      };
    }
    await delay(1000);
    attempts++;
  }
  throw new Error("Failed to extract chat: Telegram not loaded");
}

// Check if Telegram chat is loaded
function isTelegramLoaded() {
  return !!document.querySelector(
    "#column-center > div.chats-container.tabs-container > div > div.bubbles"
  );
}

// Determine if the chat is a group chat
function isGroupChat() {
  return !!document.querySelectorAll(
    "#column-right > div > div > div.sidebar-content > div > div > div.search-super > div.search-super-tabs-container.tabs-container > div.search-super-tab-container.search-super-container-members.tabs-tab.active > div > ul > a > div.row-row.row-title-row.dialog-title > div.row-title.no-wrap.user-title > span"
  ).length;
}

// Get the current user's ID
function getMyId() {
  return JSON.parse(localStorage.getItem("user_auth")).id;
}

// Extract chat members
function extractChatMembers() {
  const myId = getMyId();

  if (isGroupChat()) {
    const memberNodes = document.querySelectorAll(
      "#column-right > div > div > div.sidebar-content > div > div > div.search-super > div.search-super-tabs-container.tabs-container > div.search-super-tab-container.search-super-container-members.tabs-tab.active > div > ul > a > div.row-row.row-title-row.dialog-title > div.row-title.no-wrap.user-title > span"
    );
    return Array.from(memberNodes).map((node) => {
      const user = extractUser(node);
      if (user.peerId === myId) user.username = "Me";
      return user;
    });
  }

  const userNode = document.querySelector("div.top > div.user-title > span.peer-title");
  return [
    extractUser(userNode),
    { peerId: myId, username: "Me" },
  ];
}

// Extract user data from a DOM node
function extractUser(node) {
  return {
    peerId: node.dataset.peerId,
    username: node.textContent || node.querySelector(".peer-title-inner")?.textContent,
  };
}

// Extract all messages
function extractMessages() {
  const bubbleGroups = document.querySelectorAll("section.bubbles-date-group > div.bubbles-group");
  return Array.from(bubbleGroups)
    .map((group) => {
      const senderId = group.querySelector(".name[data-peer-id]")?.dataset.peerId || null;
      const messageNodes = group.querySelectorAll(
        "div.bubble[data-mid]:not(.photo):not(.is-message-empty):not(.voice-message)"
      );
      return Array.from(messageNodes).map((node) => extractMessage(node, senderId));
    })
    .flat();
}

// Extract a single message
function extractMessage(node, senderId) {
  const message = {
    messageId: node.dataset.mid,
    timestamp: node.dataset.timestamp,
    text: extractText(node.querySelector(".message")),
    senderId: node.classList.contains("is-out") ? getMyId() : senderId || node.dataset.peerId,
  };
  if (node.dataset.replyToMid) {
    message.replyToMid = node.dataset.replyToMid;
  }
  return message;
}

// Extract text content from a message node
function extractText(messageNode) {
  const unwantedClasses = new Set(["time", "time-inner", "clearfix"]);
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    if (Array.from(node.classList).some((cls) => unwantedClasses.has(cls))) return "";
    if (node.tagName === "IMG" && node.classList.contains("emoji")) return node.alt || "";
    return Array.from(node.childNodes).map(walk).join("");
  }
  return walk(messageNode).trim();
}
