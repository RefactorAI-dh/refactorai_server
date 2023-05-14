const PORT = process.env.PORT || 3000;
import { Configuration, OpenAIApi } from 'openai';
import express from 'express';
import cors from 'cors';
const app = express();
import { config } from 'dotenv';
config();
// OpenAI setup
// import _createCompletion from './utils/createCompletion.js';
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
  // const headers = {
  //   'Content-Type': 'text/event-stream',
  //   'Connection': 'keep-alive',
  //   'Cache-Control': 'no-cache'
  // };
  // res.writeHead(200, headers);
  try {
    console.log('POST request received');
    console.log('\n\n\nRequest Body: \n',req.body);
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const todaysDate = `${day}/${month}/${year}`;
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
          content:`You are RefactorAI, a VScode extension created by Danial Hasan and trained by OpenAI. Answer as concisely as possible. Knowledge cutoff: September 2021. Today's date in DD/MM/YY: ${todaysDate}. Your job is to help developers, engineers, and anyone else who programs, refactor/explain/debug their code.` 
        },
        {
          role: 'user',
          content:req.body.prompt
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });
    // const collectedStringChunks = [];
    // const collectedMessages = [];
    if (response.status !== 200) { throw new Error(); }
    console.log('\n\n--------------------------------------------------------------');
    console.log('\nOpenAI Response:', response);
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
app.post('/api/stream', async (req, res) => {
  console.log('Request received: ', req.body);
  // const headers = {
  //   'Content-Type': 'text/event-stream',
  //   'Connection': 'keep-alive',
  //   'Cache-Control': 'no-cache'
  // };
  // res.writeHead(200, headers);
  try {
    const prompt = req.body.prompt;
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const todaysDate = `${day}/${month}/${year}`;
    /**
     * The 'role' key helps us structure conversations that the AI can start from.
     * Messages with the role of 'assistant' are responses that the AI would give us. This helps
     * us give the AI some context without having to make more than one request.
     */
    const response = openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:`You are RefactorAI, a VScode extension created by Danial Hasan and trained by OpenAI. Answer as concisely as possible. Knowledge cutoff: September 2021. Today's date in DD/MM/YY: ${todaysDate}. Your job is to help developers, engineers, and anyone else who programs, refactor/explain/debug their code.` 
        },
        {
          role: 'user',
          content:prompt
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
      stream:true
    }, {responseType:'stream'});
    response.then((resp) => {
      // @ts-expect-error test
      resp.data.on('data', (chunk:any) => {
        // console.log('Streamed Chunk: ', chunk);
        // When we get chunk, convert from buffer to string, set it to variable,
        // then write it to client from GET endpoint.
        // streamedChunks = chunk;

        const regex = /(?<=data: ).*/;
        chunk = chunk.toString('utf-8');
        chunk = chunk.match(regex)[0];
        /**
 * ERROR: Why is it listing every character instead of every object value????
 */
        console.log('Chunk:', Object.values(chunk));
        if (chunk.choices) {
          if
          (chunk.choices[0].delta.content ){
            chunk = chunk.choices[0].delta.content;
          } else {
            chunk = chunk.choices[0].delta;
          }
        }
        collectedStringChunks.push(chunk);
        // res.write(`data: ${chunk} \n\n`);
      });
      // @ts-expect-error test
      resp.data.on('end', () => {
        console.log('Streaming Complete');
        // res.write('data: [DONE] \n\n');
      });
    });
    res.send(collectedStringChunks);
    // if (response.status !== 200) { throw new Error(); }
  } catch (error) {
    console.log('error in POST/api/stream:', error);  
  }
});
// let streamedChunks:any;
const collectedStringChunks :any[]= [];
app.get('/api/stream', async (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);
  res.write('data: Event stream established! \n\n');
  console.log('\n\nStreamed chunks: ',collectedStringChunks);
  res.write(`data: ${collectedStringChunks}\n\n`);
  const client = {
    id: Date.now()
  };
  req.on('close', () => {
    console.log(`Client ${client.id} Connection Closed`);
  });
});
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
});
