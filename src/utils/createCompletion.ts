import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
export default async function _createCompletion({
  model,
  prompt,
  temperature,
  max_tokens,
}: CreateCompletionRequest): Promise<any> {
  const response = await openai.createCompletion({
    model,
    prompt,
    temperature,
    max_tokens,
  });
  return response;
}
