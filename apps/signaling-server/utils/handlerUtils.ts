import { WebSocket } from "ws";
import { Room } from '../classes/Room';
import { JoinCallRequest } from "@repo/schema/JoinCall.schema";
import { messageType } from "@repo/schema/MessageType.schema";
import { SendRequest } from "@repo/schema/SendRequest.schema";
import { CreateOffer } from "@repo/schema/CreateOffer.schema";
import { CreateAnswer } from "@repo/schema/CreateAnswer.schema";
import { IceCandidate } from "@repo/schema/IceCandidate.schema";

export const joinRequestHandler = (message: any, rooms: Array<Room>, ws: WebSocket, idCounter: number) => {
    const parsed = JoinCallRequest.safeParse(message);
    if(!parsed.success) {
        console.log("Error after receiving the join request.");
        console.log(parsed.error);
        return;
    }
    const roomName = parsed.data.roomName;
    const room = rooms.find(room => room.getRoomName() == roomName);

    if(room) {
        const userId = room.addMember(ws);
        const roomId = room.getRoomId();
        const body: JoinedCallResponse = {
            type: messageType.JOINED,
            userId: userId,
            roomId: roomId
        }
        ws.send(JSON.stringify(body));

        const members = room.getMembers();
        members.map((member) => {
            const body: requestSender = {
                type: messageType.REQUEST_SENDER,
                toUserId: member.id,
                fromUserId: userId,
                roomId: roomId
            };
            const toSendWs: WebSocket | null = member.ws;
            if(!toSendWs) {
                console.log(`error in getting associated web socket connection for ${member.id} from ${userId}`);
                return;
            }

            toSendWs.send(JSON.stringify(body));
        });

        return {rooms, idCounter};
    } else {
        const roomId = idCounter++;
        const roomName = parsed.data.roomName;
        const room: Room = new Room(roomId, roomName, []);
        const userId:number = room.addMember(ws);
        rooms.push(room);

        const body: JoinedCallResponse = {
            type: messageType.JOINED,
            userId: userId,
            roomId: roomId
        }
        ws.send(JSON.stringify(body));

        return {rooms, idCounter};
    }
}

export const receiverToSendRequest = (message: any, rooms: Array<Room>) => {
    const parsed = SendRequest.safeParse(message);
    if(!parsed.success) {
        console.log("Error after getting an request for receiver to send.");
        console.log(parsed.error);
        return;
    }
    const roomId = parsed.data.roomId;
    const userId = parsed.data.toUserId;
    const fromUserId = parsed.data.fromUserId;
    const room = rooms.find(room => room.getRoomId() == roomId);
    if(!room) {
        console.log("Did not get corresponding room in which sockets are present");
        return;
    }
    const wsToSend = room.getMembers().find((member) => {return member.id == userId})?.ws;
    if(!wsToSend) {
        console.log("Did not get the socket for desitantion");
        return;
    }

    const body: requestSender = {
        type: messageType.REQUEST_RECEIVER_TO_SEND,
        toUserId: userId,
        fromUserId: fromUserId,
        roomId: roomId
    }
    wsToSend.send(JSON.stringify(body));
}

export const createOfferRequest = (message: any, rooms: Array<Room>) => {
    const parsed = CreateOffer.safeParse(message);
    if(!parsed.success) {
        console.log("Error after receiving the createOffer to Signaling server");
        console.log(parsed.error);
        return;
    }
    const toUserId = parsed.data.toUserId;
    const fromUserId = parsed.data.fromUserId;
    const roomId = parsed.data.roomId;

    const room = rooms.find((r) => {return r.getRoomId() == roomId});
    if(!room) {
        console.log("Error in getting the information about the room.")
        return;
    }
    const member = room.getMembers().find((m) => {return m.id == toUserId});
    if(member && member.ws) {
        const wsToSend = member.ws;
        const body: CreateOffer = {
            type: messageType.CREATE_OFFER,
            toUserId: toUserId,
            fromUserId: fromUserId,
            roomId: roomId,
            sdp: parsed.data.sdp
        };
        wsToSend.send(JSON.stringify({body}));
        return;
    }
    console.log("Error in getting the WebSocket for sending the createOffer");
    return;
}

export const createAnswerRequest = (message: any, rooms: Array<Room>) => {
    const parsed = CreateAnswer.safeParse(message);
    if(!parsed.success) {
        console.log(`Error after gettingt createAnswer request.`);
        console.log(parsed.error);
        return;
    }

    const toUserId = parsed.data.toUserId;
    const fromUserId = parsed.data.fromUserId;
    const roomId = parsed.data.roomId;
    const room = rooms.find((r) => {return r.getRoomId() == roomId});

    if(!room) {
        console.log("Cannot find the room after getting createAnswer request");
        return;
    }

    const member = room.getMembers().find((m) => {return m.id == toUserId});
    if(member && member.ws) {
        const wsToSend = member.ws;
        const body: CreateAnswer = {
            type: messageType.CREATE_ANSWER,
            toUserId: toUserId,
            fromUserId: fromUserId,
            roomId: roomId,
            sdp: parsed.data.sdp
        }
        wsToSend.send(JSON.stringify({body}));
        return;
    }

    console.log("Error in getting the WebSocket for sending the CreateAnswer.");
    return;
}

export const iceCandidateHandler = (message:any, rooms: Array<Room>) => {
    const parsed = IceCandidate.safeParse(message);
    if(!parsed.success) {
        console.log("Error after getting the ice candaidates");
        console.log(parsed.error);
        return;
    }
    const toUserId = parsed.data.toUserId;
    const fromUserId = parsed.data.fromUserId;
    const roomId = parsed.data.roomId;
    const room = rooms.find((r) => {return r.getRoomId() == roomId});
    if(!room) {
        console.log("Cannot get the room for sending the iceCandidates.");
        return;
    }

    const member = room.getMembers().find((m) => {return m.id == toUserId});
    if(member && member.ws) {
        const wsToSend = member.ws;
        const body: IceCandidate = {
            type: parsed.data.type,
            toUserId: toUserId,
            fromUserId: fromUserId,
            candidate: parsed.data.candidate,
            roomId: roomId
        }
        wsToSend.send(JSON.stringify(body));
        return;
    }

    console.log("Error in getting the websocket to send the candidate");
}