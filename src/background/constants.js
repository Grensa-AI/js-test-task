export const API = {
  OPENAI_BASE_URL: "https://api.openai.com/v1",
}

export const PROMPTS = {
  en: "Create a detailed summary of the Telegram chat in Russian. • Important information: contacts, links, instructions REQUIREMENTS: - Write a short, informative 4-5 sentences - No headings - Do not cut off sentences in the middle - If the text doesn't fit, shorten less important parts but keep the structure AVOID general phrases like \"participants discussed\", \"the chat mentioned\".",
}
export const MODEL = {
  NAME: "gpt-4.1-nano",
  TEMPERATURE: 0.3,
  MAX_TOKENS: 500,
}
