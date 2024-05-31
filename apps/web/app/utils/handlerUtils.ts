import { JoinedCallResponse } from "@repo/schema/JoinCallSchema";
import { CreateOffer } from "@repo/schema/CreateOffer";
import { messageType } from "@repo/schema/MessageType";
import { CreateAnswer } from "@repo/schema/CreateAnswer";
import { IceCandidate } from "@repo/schema/IceCandidate";
import { SendRequest } from "@repo/schema/SendRequest";
import { CloseTrackSchema } from "@repo/schema/CloseTrack";
import { CloseConnection } from "@repo/schema/CloseConnection";

const getUserIdAndRoomId = () => {
    const userId: number = Number(sessionStorage.getItem("userId"));
    const roomId: number = Number(sessionStorage.getItem("roomId"));
    return {userId, roomId};
}

export const joinedUtil = (message: any) => {
    const parsed = JoinedCallResponse.safeParse(message);
    if(!parsed.success) {
        console.log("Error in getting the userId and roomId.");
        console.log(parsed.error);
        return;
    }

    sessionStorage.setItem("userId", parsed.data.userId.toString());
    sessionStorage.setItem("roomId", parsed.data.roomId.toString());
}

export const createOfferUtil = (message: any, socket: WebSocket, pc: Array<PeerConnection>, setPc: any) => {
    const parsed = CreateOffer.safeParse(message);
    if(!parsed.success) {
        console.log("Error after createOffer is received");
        console.log(parsed.error);
        return;
    }

    const {userId, roomId} = getUserIdAndRoomId();
    const fromUserId = parsed.data.fromUserId;
    const peerId = fromUserId * 100 + userId;
    const peerIndex = pc.findIndex(p => {return p.userId == peerId});
    let peerPc:any;
    if(peerIndex === -1) {
        peerPc = new RTCPeerConnection();
        const peer: PeerConnection = {pc: peerPc, userId: (fromUserId * 100 + userId), track: []};
        pc.push(peer); 
        sessionStorage.setItem("pc", JSON.stringify(pc));
        setPc([...pc]);
    } else {
        peerPc = pc.at(peerIndex)?.pc;
    }
    peerPc.setRemoteDescription(parsed.data.sdp).then(() => {
        peerPc.createAnswer().then(async (answer:RTCSessionDescriptionInit) => {
            await peerPc.setLocalDescription(answer);
            const body: CreateAnswer = {
                toUserId: fromUserId,
                fromUserId: userId,
                sdp: answer,
                roomId: roomId,
                type: messageType.CREATE_ANSWER
            }
            socket.send(JSON.stringify(body));
        })
    });
    sessionStorage.setItem("pc", JSON.stringify(pc));
 }

 export const createAnswerUtil = async (message: any, pc: Array<PeerConnection>) => {
    const parse = CreateAnswer.safeParse(message);
    if(!parse.success) {
        console.log("Error after create answer is received.");
        console.log(parse.error);
        return;
    }
    
    const {userId, roomId} = getUserIdAndRoomId();
    const fromUserId = parse.data.fromUserId;
    const peerId = userId*100 + fromUserId;
    const peerPc = pc.find(p => p.userId == peerId)?.pc;
    if(!peerPc) {
        console.log("Peer Connection Expected but not found");
        return;
    }

    await peerPc.setRemoteDescription(parse.data.sdp);
    sessionStorage.setItem("pc", JSON.stringify(pc));
    console.log("answer created");
 }

 export const iceCandidateFromSenderUtil = async (message: any, pc: Array<PeerConnection>) => {
    const parsed = IceCandidate.safeParse(message);
    if(!parsed.success) {
        console.log("Error after getting the ice candidate from sender");
        console.log(parsed.error);
        return;
    }

    const { userId, roomId } = getUserIdAndRoomId();
    const fromUserId = parsed.data.fromUserId;
    const peerId = fromUserId * 100 + userId;
    const peer = pc.find((p) => {return p.userId == peerId});
    if(!peer) {
        console.log("Unable in getting the peerConnection object for setting the Ice Candidate.");
        return;
    }

    const peerPc = peer.pc;
    await peerPc.addIceCandidate(parsed.data.candidate);
    sessionStorage.setItem("pc", JSON.stringify(pc));
 }

 export const iceCandidateFromReceiverUtil = async (message: any, pc: Array<PeerConnection>) => {
    const parsed = IceCandidate.safeParse(message);
    if(!parsed.success) {
        console.log("Error after getting the ice candidate from sender.");
        console.log(parsed.error);
        return;
    }

    const {userId, roomId} = getUserIdAndRoomId();
    const fromUserId = parsed.data.fromUserId;
    const peerId = userId * 100 + fromUserId;
    const peer = pc.find((p) => {return p.userId == peerId});
    if(!peer){
        console.log("Unable in getting the peerConnection object for setting the Ice Candidate.");
        return;
    }

    const peerPc = peer.pc;
    await peerPc.addIceCandidate(parsed.data.candidate);
    sessionStorage.setItem("pc", JSON.stringify(pc));
 }

 export const requestToSendUtil = (message: any, socket: WebSocket, pc: Array<PeerConnection>, setPc: any) => {
    const parsed = SendRequest.safeParse(message);
    if(!parsed.success) {
        console.log("Error after the request to send received.");
        console.log(parsed.error);
        return;
    }
    const {userId, roomId} = getUserIdAndRoomId();
    const fromUserId = parsed.data.fromUserId;
    const peerId = userId * 100 + fromUserId;

    if(pc.findIndex(p => p.userId == peerId) == -1) {
        const peer = new RTCPeerConnection();
        const peerPc: PeerConnection = {pc: peer, userId: peerId, track: []};
        pc.push(peerPc);
        setPc([...pc]);
    }

    if(parsed.data.type == messageType.REQUEST_SENDER) {
        const body: requestSender = {
            type: messageType.REQUEST_RECEIVER_TO_SEND,
            fromUserId: userId,
            toUserId: fromUserId,
            roomId: roomId
        }
        socket.send(JSON.stringify(body));
    }

    sessionStorage.setItem("pc", JSON.stringify(pc));
 }

 export const handleCloseTrackUtil = (message: any) => {
    const parsed = CloseTrackSchema.safeParse(message);

    if(!parsed.success) {
        console.log("Issue while handling the close track request.");
        console.log(parsed.error.message);
        return;
    }

    const fromUserId = parsed.data.fromUserId;
    const trackType = parsed.data.trackType;

    const targetElement = trackType == "video" ?
     document.getElementById(trackType + fromUserId.toString()) as unknown as HTMLVideoElement
     : document.getElementById(trackType + fromUserId.toString()) as unknown as HTMLAudioElement;
    targetElement && (targetElement.srcObject = null);
 }

export const handleCloseConnectionUtil = (message: any, pc: Array<PeerConnection>, setPc: any) => {
    const parsed = CloseConnection.safeParse(message);
    if(!parsed.success) {
        console.log("Error in prossesing the close connection request.");
        console.log(parsed.error);
        return;
    }
    const fromUserId = parsed.data.fromUserId;

    pc.map((peer, index) => {
        const peerPc = peer.pc;
        const id = peer.userId;

        if(fromUserId == Math.floor(id / 100) || fromUserId == (id % 100)) {
            // receiving or sending from/to the close connection
            pc.splice(index, 1);
            setPc([...pc]);
        }
    })
    sessionStorage.setItem("pc", JSON.stringify(pc));
}