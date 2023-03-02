import axios from 'axios';
import bcrypt from 'bcrypt';
const bcryptSaltRounds = 10;
import { JsonDB, Config } from 'node-json-db';
const db = new JsonDB(
  new Config('database/dev_SocialBridge_Database', true, true)
);
const PORT = process.env.PORT || 3000;
import express from 'express';
import cors from 'cors';
const app = express();
import { config } from 'dotenv';
import { Client } from '@notionhq/client';
config();

app.use(
  cors({
    origin: 'http://localhost:8080',
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', async (req, res, next) => {
  res.sendFile(__dirname + '/index.html');
  try {
  } catch (error) {
    if (error.body) {
      console.log(error.body);
    } else {
      console.log(error);
    }
    res
      .status(502)
      .send(
        'There was an issue with the RefactorAI API. Please try again later.'
      );
  }
});
app.get('/api', async (req, res, next) => {
  try {
    console.log('Request received on /api!');
    res.send('Successful!');
  } catch (error) {
    res.status(502).end();
  }
});

app.get('/auth', async (req, res, next) => {
  try {
    res.send('Auth route hit!');
  } catch (error) {
    console.log(error);
    res.status(502).send('there was a problem with our auth route.');
  }
});

const pushToDatabase = async (dataPath, data) => {
  return await db.push(dataPath, data);
};
const getFromDatabase = async (dataPath) => {
  return await db.getData(dataPath);
};
let saltSecret = (secret, workspace_id) => {
  bcrypt.genSalt(bcryptSaltRounds, (err, salt) => {
    bcrypt.hash(secret, salt, async function (err, hash) {
      if (err) {
        console.log(err);
        throw new err();
      }
      console.log('<------------------------->');
      console.log(`Unhashed: ${secret}`);
      console.log(`Hashed: ${hash}`);
      console.log('<------------------------->');

      await pushToDatabase(`/${workspace_id}`, hash);
      console.log(await getFromDatabase('/'));
    });
  });
};
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
});
