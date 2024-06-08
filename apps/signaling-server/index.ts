import { WebSocket } from 'ws';
import express from "express";
import http from "http";
import { socketMessageHandler } from './handler/MessageHandler';

const app = express();
app.use(express.static("public"));
const server = http.createServer(app);

const wss = new WebSocket.Server({server});
server.listen(8080);

app.get("/", (req, res) => {
  res.send("ME-MEET SERVER...");
})

wss.on('connection', function connection(ws: WebSocket) {
  ws.on('error', console.error);
  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    socketMessageHandler(message, ws);
  });
});


