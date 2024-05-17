"use client"
import { useEffect, useState, useRef, use } from "react";
import { joinCallHandler, serverMessagesHandler } from "../utils/handlers/SocketMessageHandlers";


const Room = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<Array<PeerConnection>>([]);
    const senderVideoRef = useRef<HTMLVideoElement>(null);
    const receiverVideoRef = useRef<HTMLVideoElement>(null);

    const getCameraStream = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getDisplayMedia({video: true}).then((stream) => {
            if(senderVideoRef != null && senderVideoRef.current!=null) {
                senderVideoRef.current.srcObject = stream;
                senderVideoRef.current.play();
            }
            stream.getTracks().forEach((track) => {
                pc?.addTrack(track);
            });
        })
    }


    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        setSocket(socket);

        socket.onopen = () => joinCallHandler(socket);
        
        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            serverMessagesHandler(socket, pc, message, setPc);
        }
    }, []);

    useEffect(()=> {
        sessionStorage.setItem("pc", JSON.stringify(pc));
        pc.map((peer) => {
            const peerPc = peer.pc;
            const userId:number = Number (sessionStorage.getItem("userId"));
            const roomId:number = Number (sessionStorage.getItem("roomId"));
            if(Math.floor(peer.userId / 100) == userId) {
                console.log(`fromUserId: ${userId}, toUserId: ${peer.userId % 100}`);
                peerPc.onnegotiationneeded = async () => {
                    const offer = await peerPc.createOffer();
                    await peerPc.setLocalDescription(offer);
                    socket?.send(JSON.stringify({type: "createOffer", toUserId: (peer.userId % 100), fromUserId: userId, sdp: offer, roomId: roomId}));
                }   
                getCameraStream(peerPc);
            } 

            peerPc.onicecandidate = (event) => {
                if(event.candidate && socket) {
                    if(Math.floor(peer.userId / 100) == userId){
                        const toUserId = peer.userId%100;
                        socket.send(JSON.stringify({type:"iceCandidateFromSender", toUserId: toUserId, fromUserId: userId, roomId: roomId, candidate: event.candidate}));
                    } else {
                        const toUserId = Math.floor(peer.userId / 100);
                        socket.send(JSON.stringify({type:"iceCandidateFromReceiver", toUserId: toUserId, fromUserId: userId, roomId: roomId, candidate: event.candidate}));
                    }
                }
            }

            peerPc.onconnectionstatechange = () => {
                console.log(peerPc.connectionState);
            }

            peerPc.ontrack = (event) => {
                if (receiverVideoRef && receiverVideoRef.current) {
                    receiverVideoRef.current.srcObject = new MediaStream([event.track]);
                    receiverVideoRef.current?.play();
                }
            }
        })
    }, [pc]);

    return <div>
        <video className="w-[40vw] h-[23vw] m-10 bg-red-200" ref={senderVideoRef}>Sender</video>
        <video className="w-[40vw] h-[23vw] m-10 bg-red-200" ref={receiverVideoRef} >Receiver</video>
    </div>
}
export default Room;