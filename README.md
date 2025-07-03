# Расширение Grensa.AI для Telegram Web

Браузерное расширение, которое анализирует чаты Telegram Web и генерирует краткие резюме через OpenAI API.

## Настройка API-ключа

1. Откройте расширение (иконка рядом с адресной строкой).
2. Введите ваш OpenAI API-ключ (начинается с `sk-`) и нажмите **«Сохранить ключ»**.
3. Ключ сохранится в `chrome.storage.local` и не попадёт в репозиторий.

## Разработка и сборка

```bash
git clone https://github.com/YOUR_USERNAME/js-test-task
cd js-test-task

# создаём ветку
git checkout -b feature/telegram-summary

# устанавливаем зависимости
yarn install

# сборка продакшн
yarn build

# или запуск в режиме разработки
yarn start