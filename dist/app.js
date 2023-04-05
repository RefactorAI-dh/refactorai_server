var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PORT = process.env.PORT || 3000;
import { Configuration, OpenAIApi } from 'openai';
import express from 'express';
// @ts-ignore
import cors from 'cors';
const app = express();
import { config } from 'dotenv';
config();
// VScode origin: 'vscode-webview://16us7kp0ha1jq6n80og26vr8afct9vbjh2bo6n34trcr0v9n4u0t',
app.use(cors({
    origin: '*',
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendFile(__dirname + '/index.html');
    try {
        res
            .status(502)
            .send('There was an issue with the RefactorAI API. Please try again later.');
    }
    catch (error) {
        if (error.body) {
            console.log(error.body);
        }
        else {
            console.log(error);
        }
    }
}));
app.get('/api', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Request received on /api', req.body);
        res.json({ result: 'It worked!' });
    }
    catch (error) {
        res.status(502).send(error);
    }
}));
/**
 * Receive calls from extension, get response from AI,
 * return response
 */
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
app.post('/api', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('POST request received');
        console.log(req.body);
        /**
         * The 'role' key helps us structure conversations that the AI can start from.
         * Messages with the role of 'assistant' are responses that the AI would give us. This helps
         * us give the AI some context without having to make more than one request.
         */
        const response = yield openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: req.body.prompt
                },
            ],
            temperature: 0.5,
            max_tokens: 100,
        });
        if (response.status !== 200) {
            throw new Error();
        }
        console.log(response.data.choices[0]);
        res.send(response.data.choices[0]);
    }
    catch (error) {
        console.log('ERROR:\n', error);
        res.status(502).send(error);
    }
}));
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server listening on port ${PORT}`);
}));
//# sourceMappingURL=app.js.map