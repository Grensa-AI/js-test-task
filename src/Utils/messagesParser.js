export function getMessagesFromTelegram() {
  const messageNodes = document.querySelectorAll(".text-content");

  const messages = Array.from(messageNodes).map((node) => {
    const clone = node.cloneNode(true);
    const meta = clone.querySelector(".MessageMeta");
    if (meta) meta.remove();
    return clone.innerText.trim();
  });

  return messages;
}