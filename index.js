import dotenv from 'dotenv'
import express from 'express';
import{ MongoClient } from 'mongodb';

dotenv.config();
const app = express();
const port = process.env.PORT;
const bancoMensagens = process.env.DB_PROJETO;

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URL);
mongoClient.connect().then(() => {
    db = mongoClient.db(bancoMensagens)
    console.log(`conectado com sucesso ao banco ${bancoMensagens}`);
})    




app.listen(port, () => {
    console.log(`Servidor funcionando na porta ${port}`)
})
