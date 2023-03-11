const PORT = process.env.PORT || 3000;
import express from 'express';
import cors from 'cors';
const app = express();
import { config } from 'dotenv';
config();
// OpenAI setup
import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const response = await openai.createCompletion({
  model: 'text-davinci-003',
  prompt: 'Say this is a test for Danial Hasan',
  temperature: 0,
  max_tokens: 20,
});
app.use(
  cors({
    origin:
      'vscode-webview://16us7kp0ha1jq6n80og26vr8afct9vbjh2bo6n34trcr0v9n4u0t',
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', async (req, res) => {
  res.sendFile(__dirname + '/index.html');
  try {
    res
      .status(502)
      .send(
        'There was an issue with the RefactorAI API. Please try again later.'
      );
  } catch (error) {
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

app.post('/api', async (req, res) => {
  try {
    res.send('IT works!');
    console.log(req.body);
  } catch (error) {
    res.status(502).send(error);
  }
});

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
});
