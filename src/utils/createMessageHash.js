export const createMessagesHash = (messages) => {
  const content = Array.isArray(messages)
    ? messages.join("|")
    : String(messages);
  const length = content.length;
  const first = content.charCodeAt(0) || 0;
  const last = content.charCodeAt(length - 1) || 0;
  const middle = content.charCodeAt(Math.floor(length / 2)) || 0;

  return `${length}_${first}_${middle}_${last}`;
};
