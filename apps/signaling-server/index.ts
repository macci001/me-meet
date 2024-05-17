import { WebSocket, WebSocketServer } from 'ws';
import { Room } from './classes/Room';
import { requestHandler } from './handler/RequestHandler';

const wss = new WebSocketServer({ port: 8080 });

let rooms: Array<Room> = []; 
let idCounter = 0;

wss.on('connection', function connection(ws: WebSocket) {
  ws.on('error', console.error);
  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    const returnedObject = requestHandler(message, rooms, ws, idCounter);
    if(returnedObject && returnedObject.rooms) {
      rooms = returnedObject.rooms;
    }
    if(returnedObject && returnedObject.idCounter) {
      idCounter = returnedObject.idCounter;
    }
  });
});