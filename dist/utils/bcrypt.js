var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from 'bcrypt';
const bcryptSaltRounds = 10;
import { JsonDB, Config } from 'node-json-db';
const db = new JsonDB(new Config('database/dev_SocialBridge_Database', true, true));
const pushToDatabase = (dataPath, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db.push(dataPath, data);
});
const getFromDatabase = (dataPath) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db.getData(dataPath);
});
export const saltSecret = (secret, workspace_id) => {
    bcrypt.genSalt(bcryptSaltRounds, (err, salt) => {
        bcrypt.hash(secret, salt, function (_err, hash) {
            return __awaiter(this, void 0, void 0, function* () {
                if (_err) {
                    console.log(_err, err);
                    throw new Error(_err);
                }
                console.log('<------------------------->');
                console.log(`Unhashed: ${secret}`);
                console.log(`Hashed: ${hash}`);
                console.log('<------------------------->');
                yield pushToDatabase(`/${workspace_id}`, hash);
                console.log(yield getFromDatabase('/'));
            });
        });
    });
};
//# sourceMappingURL=bcrypt.js.map