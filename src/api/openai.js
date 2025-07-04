import OpenAI from "openai";
const apiKey = process.env.REACT_APP_OPENAI_KEY;

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

export const generateSummary = async (messages) => {
    const prompt = 
`Анализируй предоставленные сообщения из чата создай профессиональное резюме на основе выявленных навыков, опыта и компетенций.
Правила:
1. Используй только информацию из сообщений, не придумывай
2. Сохраняй профессиональный тон
3. Группируй похожие навыки
4. Для опыта указывай реальные периоды или "Настоящее время"
5. Если данных недостаточно, так и укажи: "Информация не указана"
6. Игнорируй названия файлов, их размеры и время отправки сообщений.
Сообщения для анализа:
`;
    const textPrompt = prompt + messages.join("\n");

    const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
            {
                role: 'user',
                content: textPrompt,
            },
        ],
    });

    return completion.choices[0].message;
}