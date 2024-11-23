import express from 'express';
import cors from 'cors'
import DFramework from './DFramework.js';
import { auth, authenticateUser } from './middleware/auth.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import BusinessBaseAPI from "./routes/business-object.js";
import { appConfig } from '@durlabh/dframework';

const app = express();
const corsOptionsDelegate = function (req, callback) {
    callback(null, { origin: true, credentials: true });
};

app.use(cors(corsOptionsDelegate));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

DFramework.util.prompt.start();

await DFramework.setSql(appConfig.sql);

app.post('/Login', auth);

app.use(authenticateUser)

app.use('/api', BusinessBaseAPI);

app.listen(appConfig.http?.port || 3001, () => {
    console.log(`Server is running on port ${appConfig.http?.port || 3001}.`);
});
