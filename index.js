import chalk from 'chalk'
import cors from 'cors';
import dayjs from 'dayjs'
//import 'dotenv/config';
import express, { json } from 'express';
//import Joi from 'joi';
//import { MongoClient } from 'mongodb';
//import { CbObj, defaults, stripHtml, version } from "string-strip-html";

const app = express();
app.use(json());
app.use(cors());


app.listen(5000, () => {
    console.log(chalk.bold.green("Servidor Funcionando na Porta 5000"))
});