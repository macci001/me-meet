import { messageType } from "@repo/schema/MessageType";
import { createAnswerUtil, createOfferUtil, iceCandidateFromReceiverUtil, iceCandidateFromSenderUtil, joinedUtil, requestToSendUtil, handleCloseTrackUtil, handleCloseConnectionUtil } from "../utils/handlerUtils";

export const joinCallHandler = (socket: WebSocket, roomName:string) => {
    const userId:number = Number (sessionStorage.getItem("userId") ? sessionStorage.getItem("userId") : -1);
    const roomId:number = Number (sessionStorage.getItem("roomId") ? sessionStorage.getItem("roomId") : -1);
    if(userId===-1 || roomId===-1){
        const body: JoinCallRequest = {
            getVideo: true,
            getAudio: true,
            roomName: roomName,
            type: messageType.JOIN
        }
        socket.send(JSON.stringify(body));
    } else {
        socket.send(JSON.stringify({"type": "resetSocket", "userId": userId, "roomId": roomId}));
    }
}

export const serverMessagesHandler = (socket: WebSocket, pc: Array<PeerConnection>, message: any, setPc: any) => {
    switch(message.type) {
        case messageType.JOINED: {
            joinedUtil(message);
            break;
        }
        case messageType.CREATE_OFFER: {
            createOfferUtil(message, socket, pc, setPc);
            break;
        }
        case messageType.CREATE_ANSWER: {
            createAnswerUtil(message, pc);
            break;
        }
        case messageType.ICE_CANDIDATE_FROM_SENDER: {
            iceCandidateFromSenderUtil(message, pc);
            break;
        }
        case messageType.ICE_CANDIDATE_FROM_RECEIVER: {
            iceCandidateFromReceiverUtil(message, pc);
            break;
        }
        case messageType.REQUEST_SENDER: {
            requestToSendUtil(message, socket, pc, setPc);
            break;
        }
        case messageType.REQUEST_RECEIVER_TO_SEND: {
            requestToSendUtil(message, socket, pc, setPc);
            break;
        }
        case messageType.CLOSE_TRACK: {
            handleCloseTrackUtil(message);
            break;
        }
        case messageType.CLOSE_CONNECTION: {
            handleCloseConnectionUtil(message, pc, setPc);   
        }
    }
}