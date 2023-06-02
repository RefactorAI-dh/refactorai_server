const PORT = process.env.PORT || 3000;
import { Configuration, OpenAIApi } from 'openai';
import express from 'express';
import cors from 'cors';
const app = express();
import { systemContext, formatTokens } from './utils/index.js';
import { config } from 'dotenv';
config();
// OpenAI setup
// import _createCompletion from './utils/createCompletion.js';
// VScode origin: 'vscode-webview://16us7kp0ha1jq6n80og26vr8afct9vbjh2bo6n34trcr0v9n4u0t',
app.use(
  cors({
    origin: '*',
  }),
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', async (_req, res) => {
  try {
    res.sendFile(__dirname + '/index.html');
  } catch (error) {
    console.log(error);
    res
      .status(502)
      .send(
        'There was an issue with the RefactorAI API. Please try again later.',
      );
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
  // const headers = {
  //   'Content-Type': 'text/event-stream',
  //   'Connection': 'keep-alive',
  //   'Cache-Control': 'no-cache'
  // };
  // res.writeHead(200, headers);
  try {
    console.log('POST request received');
    console.log('\n\n\nRequest Body: \n', req.body);
    /**
     * The 'role' key helps us structure conversations that the AI can start from.
     * Messages with the role of 'assistant' are responses that the AI would give us. This helps
     * us give the AI some context without having to make more than one request.
     */
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: systemContext,
        },
        {
          role: 'user',
          content: req.body.prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });
    // const collectedStringChunks = [];
    // const collectedMessages = [];
    if (response.status !== 200) {
      throw new Error();
    }
    console.log(
      '\n\n--------------------------------------------------------------',
    );
    console.log('\nOpenAI Response:', response.data.choices[0]);
    res.send(response.data.choices[0]);
  } catch (error) {
    console.log('ERROR:\n', error);
    res.status(502).send(error);
  }
});

/**
 * 1. Client establishes EventSource connection to this server.
 * 2. Server receives request, sends request to OpenAI with stream:true
 * 3. Forward OpenAI response to client.
 * 4. On [DONE] from OpenAI, close connection to both servers.
 */
let prompt = '';
app.post('/api/stream', async (req, res) => {
  console.log('Request received: ', req.body);
  try {
    /**
     * The 'role' key helps us structure conversations that the AI can start from.
     * Messages with the role of 'assistant' are responses that the AI would give us. This helps
     * us give the AI some context without having to make more than one request.
     */
    prompt = req.body.prompt;
    res.send(`\nPrompt received: \n${prompt}`);
    // if (response.status !== 200) { throw new Error(); }
  } catch (error) {
    console.log('error in POST/api/stream:', error);
  }
});
app.get('/api/stream', async (req, res) => {
  /**
   * 1. Establish event stream.
   * 2. Create OpenAI request with prompt from POST.
   * 3. Feed back the responses.
   */
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);
  res.write('data: Event stream established! \n\n');
  const client = {
    id: Date.now(),
  };
  try {
    let allFormattedTokens = '';
    const tokens: string[] = [];
    console.log('\nPROMPT: ', prompt);
    const response = openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: systemContext,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 3000,
        stream: true,
      },
      { responseType: 'stream' },
    );
    response.then((resp) => {
      // @ts-expect-error test
      resp.data.on('data', (chunk: any) => {
        /**
         * Grab chunk, place chunk in tokens array, format array of
         * tokens once its length = 4, send formatted string sentence.
         * If length > 4, clear tokens array.
         */
        const regex = /(?<=data: ).*/;
        chunk = chunk.toString();
        // Grab second data object to get first token
        if (chunk.split('\n').filter(Boolean)[1]) {
          chunk = chunk.split('\n').filter(Boolean)[1];
        }
        chunk = chunk.match(regex)[0];
        if (chunk !== '[DONE]') {
          chunk = JSON.parse(chunk);
        }
        console.log('\n\nChunk:', chunk);
        if (chunk.choices) {
          if (chunk.choices[0].delta.content) {
            console.log('text: ', chunk.choices[0].delta.content);
            chunk = chunk.choices[0].delta.content;
          } else {
            chunk = chunk.choices[0].delta;
          }
        }
        let formattedTokens;
        // Tokens list not full, don't format yet
        if (tokens.length < 5 && chunk !== '[DONE]') {
          tokens.push(chunk);
          return;
        } else {
          // Tokens list is full, format and send to client
          formattedTokens = formatTokens(tokens);
          allFormattedTokens += formattedTokens;
          console.log('Formatted tokens:\n ', formattedTokens);
          res.write(`data: ${formattedTokens} \n\n`);
          tokens.length = 0;
          if (chunk === '[DONE]') return;
          tokens.push(chunk);
        }
      });
      // @ts-expect-error test
      resp.data.on('end', () => {
        console.log('Streaming Complete. All formatted tokens:\n');
        console.log(allFormattedTokens);
        res.write('data: [DONE] \n\n');
      });
    });
  } catch (error) {
    console.error('\nERROR IN GET/api/stream ENDPOINT:', error);
  }
  req.on('close', () => {
    console.log(`Client ${client.id} Connection Closed`);
  });
});
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
});
