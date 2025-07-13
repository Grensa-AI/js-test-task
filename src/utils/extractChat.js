/**
 * Attempts to extract Telegram chat data, retrying up to maxAttempts times if Telegram is not loaded.
 * Waits 1 second between attempts.
 * 
 * @param {number} attempts - Current attempt count (default 0).
 * @param {number} maxAttempts - Maximum attempts before failing (default 10).
 * @returns {Promise<Object>} Resolves with extracted chat data: chatId, members, messages, and type.
 * @throws Will throw an error if Telegram chat is not loaded after maxAttempts.
 */
export default async function extractChat(attempts = 0, maxAttempts = 10) {
  console.log("Trying to extract messages");
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  while (attempts < maxAttempts) {
    if (isTelegramLoaded()) {
      await delay(1000); // Wait for messages to load
      return {
        chatId: getChatId(),
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

/**
 * Checks if Telegram chat UI is loaded by querying a specific DOM element.
 * 
 * @returns {boolean} True if Telegram chat is loaded, false otherwise.
 */
function isTelegramLoaded() {
  return !!document.querySelector(
    "#column-center > div.chats-container.tabs-container > div > div.bubbles"
  );
}

/**
 * Extracts the current chat's ID from the DOM.
 * 
 * @returns {string|null} Chat ID or null if not found.
 */
function getChatId() {
  return document.querySelector("div.top > div.user-title > span.peer-title")?.dataset.peerId || null;
}

/**
 * Checks if the current chat is a group chat by inspecting the members list.
 * 
 * @returns {boolean} True if group chat, false if personal chat.
 */
function isGroupChat() {
  return !!document.querySelectorAll(
    "#column-right > div > div > div.sidebar-content > div > div > div.search-super > div.search-super-tabs-container.tabs-container > div.search-super-tab-container.search-super-container-members.tabs-tab.active > div > ul > a > div.row-row.row-title-row.dialog-title > div.row-title.no-wrap.user-title > span"
  ).length;
}

/**
 * Gets the current user's ID from localStorage.
 * 
 * @returns {string|null} User ID or null if not found.
 */
function getMyId() {
  const userAuth = localStorage.getItem("user_auth");
  if (!userAuth) return null;
  try {
    return JSON.parse(userAuth).id;
  } catch {
    return null;
  }
}

/**
 * Extracts chat members from the DOM.
 * For group chats, extracts all members; for personal chats, returns the other user and "Me".
 * 
 * @returns {Array<{peerId: string, username: string}>} List of chat members.
 */
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

/**
 * Extracts user data from a DOM node.
 * 
 * @param {Element} node - DOM element representing a user.
 * @returns {{peerId: string, username: string}} User object.
 */
function extractUser(node) {
  return {
    peerId: node.dataset.peerId,
    username: node.textContent || node.querySelector(".peer-title-inner")?.textContent || "",
  };
}

/**
 * Extracts all chat messages from the DOM.
 * 
 * @returns {Array<Object>} Array of message objects.
 */
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

/**
 * Extracts a single message object from a message DOM node.
 * 
 * @param {Element} node - DOM element representing a message bubble.
 * @param {string|null} senderId - The sender's peer ID.
 * @returns {Object} Message object.
 */
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

/**
 * Recursively extracts text content from a message node, ignoring unwanted elements.
 * 
 * @param {Element} messageNode - DOM element containing the message content.
 * @returns {string} Extracted and trimmed text content.
 */
function extractText(messageNode) {
  const unwantedClasses = new Set(["time", "time-inner", "clearfix"]);

  function walk(node) {
    if (!node) return "";
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    if (Array.from(node.classList).some((cls) => unwantedClasses.has(cls))) return "";
    if (node.tagName === "IMG" && node.classList.contains("emoji")) return node.alt || "";
    return Array.from(node.childNodes).map(walk).join("");
  }

  return walk(messageNode).trim();
}
