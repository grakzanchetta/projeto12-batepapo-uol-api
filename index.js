import cors from 'cors';
import dayjs from 'dayjs';
import dotenv from 'dotenv'
import express, { json } from 'express';
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
    })
    await db.collection('messages').insertOne({
        from: participant.name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs().format('HH:mm:ss')
    })

    response.sendStatus(201)
    
    } catch (error){
        response.send('Participante não registrado!')
    }
})


app.listen(port)