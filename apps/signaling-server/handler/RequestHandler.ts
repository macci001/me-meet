import { messageType } from "@repo/schema/MessageType.schema";
import { WebSocket } from "ws";
import { Room } from "../classes/Room";
import { createAnswerRequest, createOfferRequest, iceCandidateHandler, joinRequestHandler, receiverToSendRequest } from "../utils/handlerUtils";

export const requestHandler = (message: any, rooms: Array<Room>, ws: WebSocket, idCounter: number) => {
    switch(message.type) { 
        case messageType.JOIN: {
            const returnedObject = joinRequestHandler(message, rooms, ws, idCounter)
            return returnedObject;
        }
        case messageType.REQUEST_RECEIVER_TO_SEND: {
            receiverToSendRequest(message, rooms);
            break;
        }
        case messageType.CREATE_OFFER: {
            createOfferRequest(message, rooms);
            break;
        }
        case messageType.CREATE_ANSWER: {
            createAnswerRequest(message, rooms);
            break;
        }
        case messageType.ICE_CANDIDATE_FROM_RECEIVER: {
            iceCandidateHandler(message, rooms);
            break;
        }
        case messageType.ICE_CANDIDATE_FROM_SENDER: {
            iceCandidateHandler(message, rooms);
            break;
        }
    }
}