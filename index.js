import cors from 'cors';
import dayjs from 'dayjs';
import dotenv from 'dotenv'
import express, { json, request } from 'express';
import joi from 'joi';
import{ MongoClient } from 'mongodb';

dotenv.config();
const app = express();
app.use(cors());
app.use(json());
const port = process.env.PORT;
const conexaoBanco = process.env.MONGO_URL;
const bancoMensagens = process.env.DB_PROJETO;

let db = null;
const mongoClient = new MongoClient(conexaoBanco);
mongoClient.connect().then(() => {
    db = mongoClient.db(bancoMensagens)
})    

app.post('/participants', async (request, response) => {
    const participant = request.body;
    const participantSchema = joi.object( { 
        name: joi.string().required()
    });
    const { error } = participantSchema.validate(participant)
    if (error){
        response.sendStatus(422);
        return;
    }
    try {
        const participantAlreadyOn = await db.collection('participants').findOne({
            name: participant.name
        });
        if (participantAlreadyOn){
            response.sendStatus(409);
            return;    
        }
    await db.collection('participants').insertOne({ 
        name: participant.name,
        lastStatus: Date.now()
    });
    await db.collection('messages').insertOne({
        from: participant.name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs().format('HH:mm:ss')
    });
    response.sendStatus(201)
    } catch (error){
        console.log(error);
        response.send('Participante não registrado!');
    }
});

app.get('/participants', async (request, response) => {
    try {
        const participants = await db.collection('participants').find().toArray();
        response.send(participants);
    } catch {
        console.log(error);
        response.send('Não foi possível retornar a lista de participantes!')
    }
});

app.post('/messages', async (request, response) => {
    const message = request.body;
    const { user } = request.headers;
    const messageSchema = joi.object ({
        to: joi.string().required(),
        text:joi.string().required(),
        type: joi.string().valid('message', 'private_message').required()
    });
    const { error } = messageSchema.validate(message)
    if (error){
        response.sendStatus(422);
        return;
    }
    try {
        const participant = await db.collection('participants').findOne({
            name: user
        })
        if (!participant){
            response.sendStatus(422);
            return;
        }
    await db.collection('messages').insertOne({
        from: user,
        to: message.to,
        text: message.text,
        type: message.text,
        time: dayjs().format('HH:mm:ss')  
    });
    response.sendStatus(201);
    } catch (error){
        console.log(error);
        response.send('Mensagem não enviada!');
    }
});




app.listen(port)