export enum messageType {
    JOIN = "join",
    JOINED = "joined",
    CREATE_OFFER = "createOffer",
    CREATE_ANSWER = "createAnswer",
    ICE_CANDIDATE_FROM_SENDER = "iceCandidateFromSender",
    ICE_CANDIDATE_FROM_RECEIVER = "iceCandidateFromReceiver",
    REQUEST_SENDER = "requestSender",
    REQUEST_RECEIVER_TO_SEND = "requestReceiverToSend",
    CLOSE_TRACK = "closeTrack",
    CLOSE_CONNECTION = "closeConnection",
}