
const MESSAGES_LIMIT = 20;

const daysOfWeek = [
  'Понедельник', 'Вторник', 'Среда', 'Четверг',
  'Пятница', 'Суббота', 'Воскресенье'
];

function getDateFromDayName(dayName) {
  const today = new Date();
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const targetIdx = daysOfWeek.indexOf(dayName);
  if (targetIdx === -1) return null;
  let diff = targetIdx - todayIdx;
  if (diff > 0) diff -= 7;
  const date = new Date(today);
  date.setDate(today.getDate() + diff);

  return date.toISOString().slice(0, 10);
}

export function getMessagesFromTelegram(limit =  MESSAGES_LIMIT) {
  const result = [];
  let count = 0;
  const messageGroups = document.querySelectorAll('.message-date-group');
  for (const group of messageGroups) {
    const daySpan = group.querySelector('.sticky-date span');
    const dayName = daySpan ? daySpan.textContent.trim() : '';
    const dateStr = getDateFromDayName(dayName);

    const messages = group.querySelectorAll('.Message.message-list-item');
    for (const msg of messages) {
      if (count >= limit) return result;

      let sender = 'Собеседник';
      if (msg.classList.contains('own')) {
        sender = 'Вы';
      } else {
        const forwarded = msg.querySelector('.sender-title');
        if (forwarded) sender = forwarded.textContent.trim();
      }

      let text = '';
      const textContent = msg.querySelector('.text-content');
      if (textContent) {
        const textClone = textContent.cloneNode(true);
        const meta = textClone.querySelector('.MessageMeta');
        if (meta) meta.remove();
        text = textClone.innerText.trim();

        if (!text) {
          if (msg.querySelector('.media-inner') || msg.querySelector('.Album')) {
            text = '[Медиа]';
          } else {
            console.warn('Сообщение без текста и медиа:', msg);
          }
        }
      }

      let time = '';
      const timeSpan = msg.querySelector('.message-time');
      if (timeSpan) time = timeSpan.textContent.trim();

      let datetime = '';
      if (dateStr && time) {
        datetime = `${dateStr} ${time}`;
      }

      result.push({
        datetime,
        sender,
        text
      });
      count++;
    }
  }
  return result;
}


