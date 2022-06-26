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
const TIME_BANK = 15000;

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
    } catch (error) {
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
        type: message.type,
        time: dayjs().format('HH:mm:ss')  
    });
    response.sendStatus(201);
    } catch (error){
        console.log(error);
        response.send('Mensagem não enviada!');
    }
});

app.get('/messages', async (request, response) => {
    const limit = parseInt(request.query.limit);
    const { user } = request.headers;

    try {
        const messages = await db.collection("messages").find().toArray();
        const filteredMessages = messages.filter(message => {
          const { from, to, type } = message;
          const toUser = to === "Todos" || (to === user || from === user);
          const isPublic = type === "message";
    
          return toUser || isPublic;
        });
    
        if (limit && limit !== NaN) {
          return response.send(filteredMessages.slice(-limit));
        }
        response.send(filteredMessages);
    } catch (error){
        console.log(error)
        console.log("Erro ao obter mensagens!");
    }
});

app.post('/status', async (request, response) => {
    const { user } = request.headers;
    try {
        const participant = await db.collection('participants').findOne({name: user});
        if(!participant){
            return response.sendStatus(404);
        }
        await db.collection("participants").updateOne({ name: user }, { $set: { lastStatus: Date.now() } });
        response.sendStatus(200);

    } catch (error) {
        console.log(error);
    }
});

setInterval(async () => {
  const seconds = Date.now() - (10000)
  try {
    const inactiveUsers = await db.collection("participants").find({ lastStatus: { $lte: seconds } }).toArray();
    if (inactiveUsers.length > 0) {
      const inactiveMessage = inactiveUsers.map(inactiveUser => {
        return {
          from: inactiveUser.name,
          to: 'Todos',
          text: 'sai da sala...',
          type: 'status',
          time: dayjs().format("HH:mm:ss")
        }
      });

      await db.collection("messages").insertMany(inactiveMessage);
      await db.collection("participants").deleteMany({ lastStatus: { $lte: seconds } });
    }
  } catch (error) {
    console.log("Erro ao remover usuários!");
  }
}, TIME_BANK);


app.listen(port)