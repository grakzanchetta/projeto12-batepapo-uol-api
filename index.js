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

app.post("/participants", (request, response) => {
    res.status(201).send();
});

app.get("/participants", (request, response) => {
});

app.post("/messages", (request, response) => {
    res.status(201).send();
});

app.get("/messages", (request, response) => {
});

app.post("/status", (request, response) => {
    res.status(200).send();
});

app.delete("/message/<id>", (request, response) => {
});

app.put("/message/<id>", (request, response) => {
});

app.listen(5000, () => {
    console.log(chalk.bold.greenBright("\nServidor Funcionando na Porta 5000. \n"));
});