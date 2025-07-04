export function getLastMessages(limit = 30) {
  const bubbleNodes = document.querySelectorAll("div.bubble-content");
  const messages = [];

  bubbleNodes.forEach((node) => {
    // Пропускаем цитаты / вложения
    if (node.closest(".reply, .quote-like, .reply-content")) return;

    // Определяем автора — если внутри bubble есть .peer-title, и она НЕ внутри цитаты
    const authorEl = Array.from(node.querySelectorAll(".peer-title")).find(
      (el) => !el.closest(".reply, .quote-like")
    );
    const isMyMessage = !authorEl;
    const author = isMyMessage ? "Вы" : authorEl.innerText.trim();

    // Получаем текст из .message.spoilers-container (это наш контейнер)
    const textEls = node.querySelectorAll(".message.spoilers-container");

    const text = Array.from(textEls)
      .map((el) => {
        const clone = el.cloneNode(true);

        // Удаляем "мусор": таймстемпы, статус, вложения
        const trashSelectors = [
          ".time",
          ".status",
          ".timestamp",
          ".clearfix",
          ".reply-content",
          ".document-wrapper",
        ];
        trashSelectors.forEach((selector) => {
          clone.querySelectorAll(selector).forEach((n) => n.remove());
        });

        return clone.innerText.trim();
      })
      .filter(Boolean) // убираем пустые строки
      .join(" "); // если по какой-то причине в одном bubble несколько контейнеров

    if (text) {
      messages.push({ author, text });
    }
  });

  const lastMessages = messages.slice(-limit);
  console.log("📥 Последние сообщения:", lastMessages);
  return lastMessages;
}