import { WebSocket } from "ws"; 
import { closeConnection, closeTrack, createAnswer, createOffer, handleJoin, iceCandidateHandler, requestReceiverToSend, resetSocket } from "../utils/handlerUtils";

export const socketMessageHandler = (message: any, ws: WebSocket) => {
    const type:string = message.type;
    switch(type) {
        case "join": {
            handleJoin(message, ws);
            break;
        }
        case "requestReceiverToSend": {
            requestReceiverToSend(message, ws);
            break;
        }
        case "createOffer" : {
            createOffer(message, ws);
            break;
        }
        case "createAnswer": {
            createAnswer(message, ws);
            break;
        }
        case "iceCandidateFromSender": {
            iceCandidateHandler(message, ws);
            break;
        }
        case "iceCandidateFromReceiver": {
            iceCandidateHandler(message, ws);
            break;
        }
        case "closeTrack": {
            closeTrack(message, ws);
            break;
        }
        case "closeConnection": {
            closeConnection(message, ws);
            break;
        }
        case "resetSocket" : {
            resetSocket(message, ws);
            break;
        }
    }
}