"use client"
import { useEffect, useState, useRef, use } from "react";
import { joinCallHandler, serverMessagesHandler } from "../handlers/SocketMessageHandlers";
import ReceiverComponent from "./ReceiverCompnent";
import SenderComponent from "./SenderComponent";
import { motion } from "framer-motion";

const Room = ({roomName} : {roomName: string}) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<Array<PeerConnection>>([]);
    const roomRef = useRef(null);

    const addTracks = async () => {
        const userId:number = Number (sessionStorage.getItem("userId"));
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        pc.map((peer) => {
            const id = peer.userId;
            const peerPc = peer.pc;
            const senderId = Math.floor(id / 100);
            if (senderId == userId) {
                stream.getTracks().forEach((track) => {
                    peerPc?.addTrack(track);
                    peer.track.push(track);
                });
            }
        })
        
        const senderComponent = document.getElementById("senderVideoRef") as unknown as HTMLVideoElement;
        if(senderComponent != null ){
            senderComponent.srcObject = new MediaStream(stream.getVideoTracks());
            senderComponent.play();
        }
    }

    const removeTracks = (type: "video" | "audio") => {
        const userId:number = Number (sessionStorage.getItem("userId"));
        const roomId:number = Number (sessionStorage.getItem("roomId"));

        const senderElement = document.getElementById("senderVideoRef") as unknown as HTMLVideoElement;
        if(senderElement != null) {
            senderElement.srcObject = null;
        }

        pc.map((peer) => {
            const id = peer.userId;
            const peerPc = peer.pc;
            const senderId = Math.floor(id / 100);
            if (senderId == userId) {
                peerPc.getSenders().map(sender => {
                    if(sender.track?.kind == type) {
                        peerPc.removeTrack(sender);
                    }
                })
                if(socket) {
                    socket.send(JSON.stringify({type: "closeTrack", toUserId: (id % 100), fromUserId: senderId, roomId: roomId, trackType: type}));
                }
            }
        })
    }

    useEffect(() => {
        const socket = new WebSocket("wss://smartlearner.pro");
        setSocket(socket);
        const roomNameFinal = !roomName ? "hello" : roomName;
        socket.onopen = () => joinCallHandler(socket, roomNameFinal);
        
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
                const id = Math.floor(peer.userId / 100);
                if (id == userId) {
                    return;
                }
                if (event.track.kind == "video") {
                    console.log("here in video");
                    const receiverElement: HTMLVideoElement = document.getElementById("video" + id.toString()) as unknown as HTMLVideoElement;
                    if(receiverElement) {
                        receiverElement.srcObject = new MediaStream([event.track]);
                        receiverElement.play();
                    }
                }
                if (event.track.kind == "audio") {
                    console.log("here in audio");
                    const receiverElement: HTMLAudioElement = document.getElementById("audio" + id.toString()) as unknown as HTMLAudioElement;
                    if(receiverElement) {
                        console.log(receiverElement);
                        receiverElement.srcObject = new MediaStream([event.track]);
                        receiverElement.play();
                    }
                }
            }
        })
    }, [pc]);

    return <div>
        {
            !pc || pc.length == 0 ? <div className="w-[100vw] font-semibold h-[20vw] flex justify-center items-center bg-fuchsia-200 text-fuchsia-700 shadow-inner">
                Nobody has joined the call. We have to wait for others to join.
            </div> : <motion.div ref={roomRef}>
            <div className="h-[80vh] w-[100vw] flex flex-wrap justify-around items-center">
            {
                pc.map((peer) => {
                    const userId:number = Number (sessionStorage.getItem("userId"));
                    const id = peer.userId;
                    if(Math.floor(id / 100) == userId) {
                        return <ReceiverComponent videoId={"video" + (id % 100).toString()} audioId={"audio" + (id % 100).toString()} key={"receiver" + (id % 100).toString()} />
                    } 
                    return null;
                })
            }
            </div>
            <SenderComponent id="senderVideoRef" roomRef={roomRef}/>
            </motion.div>
        }
        
        <div className="w-[100vw] h-[7vh] bg-fuchsia-50 fixed bottom-0 flex justify-center items-center gap-[5vw]">
            <button onClick={addTracks} className="w-[10vh] h-[4vh] bg-fuchsia-200 shadow-inner rounded-[5vh] font-medium hover:bg-fuchsia-400">ON</button>
            <button onClick={() => removeTracks("video")} className="w-[10vh] h-[4vh] bg-fuchsia-200 shadow-inner rounded-[5vh] font-medium hover:bg-fuchsia-400">OFF Vid</button>
            <button onClick={() => removeTracks("audio")} className="w-[10vh] h-[4vh] bg-fuchsia-200 shadow-inner rounded-[5vh] font-medium hover:bg-fuchsia-400">OFF Aud</button>
        </div>
    </div>
}
export default Room;