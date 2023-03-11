import bcrypt from 'bcrypt';
const bcryptSaltRounds = 10;
import { JsonDB, Config } from 'node-json-db';
const db = new JsonDB(
  new Config('database/dev_SocialBridge_Database', true, true)
);
const pushToDatabase = async (dataPath, data) => {
  return await db.push(dataPath, data);
};
const getFromDatabase = async (dataPath) => {
  return await db.getData(dataPath);
};

export const saltSecret = (secret, workspace_id) => {
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
