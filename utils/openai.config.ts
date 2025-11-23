import { Configuration, OpenAIApi } from 'openai'

export function getOpenAIConfig(): Configuration {
  return new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export function getOpenAIApiInstance(): OpenAIApi {
  return new OpenAIApi(getOpenAIConfig())
}
