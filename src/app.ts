const PORT = process.env.PORT || 3000;
import express from 'express';
// @ts-ignore
import cors from 'cors';
const app = express();
import { config } from 'dotenv';
config();
// OpenAI setup
import _createCompletion from './utils/createCompletion.js';
// VScode origin: 'vscode-webview://16us7kp0ha1jq6n80og26vr8afct9vbjh2bo6n34trcr0v9n4u0t',
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', async (_req, res) => {
  res.sendFile(__dirname + '/index.html');
  try {
    res
      .status(502)
      .send(
        'There was an issue with the RefactorAI API. Please try again later.'
      );
  } catch (error: any) {
    if (error.body) {
      console.log(error.body);
    } else {
      console.log(error);
    }
  }
});
app.get('/api', async (req, res) => {
  try {
    console.log('Request received on /api', req.body);
    res.json({ result: 'It worked!' });
  } catch (error) {
    res.status(502).send(error);
  }
});
/**
 * Receive calls from extension, get response from AI,
 * return response
 */

import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
app.post('/api', async (_req, res) => {
  try {
    console.log('POST request received');
    console.log('OpenAI api key: ', process.env.OPENAI_API_KEY);
    // const response = await _createCompletion({
    const response = await openai.createCompletion({
      model: 'text-davinci-002',
      prompt: 'Return the following text: `It works! Danial Hasan.`',
      temperature: 0.5,
      max_tokens: 30,
    });
    // });
    if (response.status !== 200) throw new Error();
    console.log('Response: ', response.data);
    res.send(response.data);
  } catch (error) {
    console.log('ERROR:\n', error);
    res.status(502).send(error);
  }
});

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
});
