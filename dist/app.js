"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PORT = process.env.PORT || 3000;
const express_1 = __importDefault(require("express"));
// @ts-ignore
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// OpenAI setup
const createCompletion_js_1 = __importDefault(require("./utils/createCompletion.js"));
app.use((0, cors_1.default)({
    origin: 'vscode-webview://16us7kp0ha1jq6n80og26vr8afct9vbjh2bo6n34trcr0v9n4u0t',
}));
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
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
app.post('/api', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, createCompletion_js_1.default)({
            model: 'gpt-3.5-turbo',
            prompt: 'Return the following text: `It works! Danial Hasan.`',
            temperature: 0.5,
            max_tokens: 30,
        });
        console.log('Response: ', response);
        res.json(response);
    }
    catch (error) {
        res.status(502).send(error);
    }
}));
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server listening on port ${PORT}`);
}));
//# sourceMappingURL=app.js.map