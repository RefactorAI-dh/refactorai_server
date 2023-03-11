import bcrypt from 'bcrypt';
const bcryptSaltRounds = 10;
import { JsonDB, Config } from 'node-json-db';
const db = new JsonDB(
  new Config('database/dev_SocialBridge_Database', true, true)
);
const pushToDatabase = async (dataPath: string, data: string) => {
  return await db.push(dataPath, data);
};
const getFromDatabase = async (dataPath: string) => {
  return await db.getData(dataPath);
};

export const saltSecret = (secret: string, workspace_id: number) => {
  bcrypt.genSalt(bcryptSaltRounds, (err: Error | undefined, salt) => {
    bcrypt.hash(secret, salt, async function (_err: any, hash) {
      if (_err) {
        console.log(_err, err);
        throw new Error(_err);
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
