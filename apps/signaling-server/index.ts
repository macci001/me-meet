import { WebSocket, WebSocketServer } from 'ws';
import { Room } from './classes/Room';
import express from "express";
import http from "http";

const app = express();
app.use(express.static("public"));
const server = http.createServer(app);

const wss = new WebSocket.Server({server});
server.listen(8080);

app.get("/", (req, res) => {
  res.send("ME-MEET SERVER...");
})

let rooms: Array<Room> = []; 
let idCounter = 0;
let mp:Map<number, boolean> = new Map<number,boolean>();

wss.on('connection', function connection(ws: WebSocket) {
  ws.on('error', console.error);
  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === 'join') {
        const roomName = message.roomName;
        const index = rooms.findIndex(room => room.roomName == roomName);
        if(index != -1) {
            const room = rooms.at(index);
            const userId = room?.addMember(ws);
            const roomId = room?.getRoomId();
            ws.send(JSON.stringify({type: "joined", userId: userId, roomId: roomId}));
            const members = room?.getMembers();
            members?.map((member) => {
              if(member.id != userId && member.ws) {
                member.ws.send(JSON.stringify({type: "requestSender", toUserId: member.id, fromUserId: userId, roomId: roomId}))
              }
            })
        } else {
          const roomId: number = idCounter++;
          const roomName = message.roomName;
          const room: Room = new Room(roomId, roomName, []);
          const userId:number = room.addMember(ws);
          rooms.push(room);
          ws.send(JSON.stringify({type: "joined", userId: userId, roomId: roomId}));
        }
    } else if(message.type === "requestReceiverToSend") {
        const roomId = message.roomId;
        const toUserId = message.toUserId;
        const fromUserId = message.fromUserId;
        const index = rooms.findIndex(room => room.roomId == roomId);
        if (index === -1) {
          return;
        }
        const room = rooms.at(index);
        const wsToSend = room?.getMembers().find(member => member.id === toUserId)?.ws;
        wsToSend?.send(JSON.stringify({type: "requestReceiverToSend", toUserId: toUserId, fromUserId: fromUserId, roomId: roomId}));
    }else if(message.type === "createOffer") {
        const roomId = message.roomId;
        const toUserId = message.toUserId;
        const fromUserId = message.fromUserId;
        const index = rooms.findIndex(room => room.roomId == roomId);
        if (index === -1) {
          return;
        }
        const room = rooms.at(index);
        const wsToSend = room?.getMembers().find(member => member.id === toUserId)?.ws;
        wsToSend?.send(JSON.stringify({type: "createOffer", sdp: message.sdp, toUserId: toUserId, fromUserId: fromUserId, roomId: roomId}));
    } else if(message.type === "createAnswer") {
      const roomId = message.roomId;
      const toUserId = message.toUserId;
      const fromUserId = message.fromUserId;
      const roomIndex = rooms.findIndex(room => room.roomId == roomId);
      if(roomIndex === -1) {
        return;
      }
      const room = rooms.at(roomIndex);
      const wsToSend = room?.getMembers().find(member => member.id === toUserId)?.ws;
      wsToSend?.send(JSON.stringify({type: "createAnswer", sdp: message.sdp, toUserId: toUserId, fromUserId: fromUserId, roomId: roomId}));
    } else if(message.type === "iceCandidateFromSender" || message.type == "iceCandidateFromReceiver") {
      const toUserId = message.toUserId;
      const fromUserId = message.fromUserId;
      const roomId = message.roomId;
      const roomIndex = rooms.findIndex(room => room.roomId == roomId);
      if(roomIndex === -1) {
        return;
      }
      const room = rooms.at(roomIndex);
      const members = room?.getMembers();
      const candidate = message.candidate;
      const member = members?.find((member) => member.id == toUserId);
      if(member) {
        member.ws?.send(JSON.stringify({type: message.type, toUserId: toUserId, fromUserId: fromUserId, candidate: candidate, roomId: roomId}))
      }
    }
  });
});