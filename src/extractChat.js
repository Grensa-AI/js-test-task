// Утилита: собирает весь текст из групп сообщений .bubbles-group
export function extractChat() {
    const groups = document.querySelectorAll('.bubbles-group');
    if (!groups.length) {
        console.warn('extractChat: не найдено ни одной группы .bubbles-group');
        return '';
    }
    return Array.from(groups)
        .map(group =>
            group.innerText
                .trim()
                // удаляем отметки времени вида "\n16:07"
                .replace(/\n\d{1,2}:\d{2}/g, '')
        )
        .join('\n');
}
