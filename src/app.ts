const PORT = process.env.PORT || 3000;
import { Configuration, OpenAIApi } from 'openai';
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
  try {
    res.sendFile(__dirname + '/index.html');
  } catch (error) {
    console.log(error);
    res.status(502).send('There was an issue with the RefactorAI API. Please try again later.');
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

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
app.post('/api', async (req, res) => {
  try {
    console.log('POST request received');
    console.log(req.body)
    let currentDate = new Date();
const day = currentDate.getDate();
const month = currentDate.getMonth() + 1; // Add 1 because January is 0
    const year = currentDate.getFullYear();
    const todaysDate = `${day}/${month}/${year}`
    /**
     * The 'role' key helps us structure conversations that the AI can start from.
     * Messages with the role of 'assistant' are responses that the AI would give us. This helps
     * us give the AI some context without having to make more than one request.
     */
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [

        {
          role: 'system',
          content:`You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible. Knowledge cutoff: September 2021. Today's date in DD/MM/YY: ${todaysDate}` 
        },
        {
          role: 'user',
          content:req.body.prompt
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });
    if (response.status !== 200) { throw new Error(); }
    console.log(response.data.choices[0]);
    res.send(response.data.choices[0]);
  } catch (error) {
    console.log('ERROR:\n', error);
    res.status(502).send(error);
  }
});

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
});
