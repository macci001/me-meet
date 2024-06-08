import { WebSocket } from "ws";
import { Room } from "../classes/Room";

let rooms: Array<Room> = []; 
let idCounter = 0;

export const handleJoin = (message: any, ws: WebSocket) => {
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
}

export const requestReceiverToSend = (message: any, ws: WebSocket) => {
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
}

export const createOffer = (message: any, ws:WebSocket) => {
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
}

export const createAnswer = (message: any, ws: WebSocket) => {
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
}

export const iceCandidateHandler = (message: any, ws: WebSocket) => {
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

export const closeTrack = (message: any, ws: WebSocket) => {
    const toUserId = message.toUserId;
    const fromUserId = message.fromUserId;
    const roomId = message.roomId;
    const roomIndex = rooms.findIndex(room => room.roomId == roomId);
    if(roomIndex === -1) {
      return;
    }
    const room = rooms.at(roomIndex);
    const members = room?.getMembers();
    const trackType = message.trackType;
    const member = members?.find((member) => member.id == toUserId);
    if(member) {
      member.ws?.send(JSON.stringify({type: message.type, toUserId: toUserId, fromUserId: fromUserId, trackType: trackType, roomId: roomId}))
    }
}

export const closeConnection = (message: any, ws: WebSocket) => {
    const toUserId = message.toUserId;
    const fromUserId = message.fromUserId;
    const roomId = message.roomId;
    const roomIndex = rooms.findIndex(room => room.roomId == roomId);
    if(roomIndex === -1) {
      return;
    }
    const room = rooms.at(roomIndex);
    const members = room?.getMembers();
    if(!members){
      return;
    }

    let updatedMembers = members;
    members?.map((member, index) => {
      if(member.id == toUserId) {
        member.ws?.send(JSON.stringify({type: message.type, toUserId: toUserId, fromUserId: fromUserId, roomId: roomId}));
        updatedMembers.splice(index, 1);
        room?.setMembers(updatedMembers);          
      }
    })
}

export const resetSocket = (message: any, ws: WebSocket) => {
    const roomId = message.roomId;
      const userId = message.userId;
      const roomIndex = rooms.findIndex(room => room.roomId == roomId);
      if(roomIndex === -1) {
        return;
      }
      const room = rooms.at(roomIndex);
      const members = room?.getMembers();
      if(!members){
        return;
      }
      members.map((member) => {
        if(member.id == userId) {
          member.ws = ws;
        }
      })
}

