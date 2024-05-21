"use client"
import { useEffect, useState, useRef, use } from "react";
import { joinCallHandler, serverMessagesHandler } from "../handlers/SocketMessageHandlers";
import ReceiverComponent from "./ReceiverCompnent";
import SenderComponent from "./SenderComponent";
import { config } from "dotenv";

const Room = ({roomName} : {roomName: string}) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<Array<PeerConnection>>([]);

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

    const removeTracks = () => {
        const userId:number = Number (sessionStorage.getItem("userId"));
        pc.map((peer) => {
            const id = peer.userId;
            const peerPc = peer.pc;
            const senderId = Math.floor(id / 100);
            if (senderId == userId) {
                peer.track.map((t) => {
                    t.enabled = false;
                })
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
                const receiverElement: HTMLVideoElement = document.getElementById("user" + id.toString()) as unknown as HTMLVideoElement;
                if (receiverElement) {
                    receiverElement.srcObject = new MediaStream([event.track]);
                    receiverElement.play();
                }
            }
        })
    }, [pc]);

    return <div>
        {
            !pc || pc.length == 0 ? <div className="w-[100vw] font-semibold h-[20vw] flex justify-center items-center bg-fuchsia-200 text-fuchsia-700 shadow-inner">
                Nobody has joined the call. We have to wait for others to join.
            </div> : <>
            <div className="h-[80vh] w-[100vw] flex flex-wrap justify-around items-center">
            {
                pc.map((peer) => {
                    const userId:number = Number (sessionStorage.getItem("userId"));
                    const id = peer.userId;
                    if(Math.floor(id / 100) == userId) {
                        return <ReceiverComponent id={"user" + (id % 100).toString()} key={"receiver" + (id % 100).toString()} />
                    } 
                    return null;
                })
            }
            </div>
            <SenderComponent id="senderVideoRef"/>
            </>
        }
        
        <div className="w-[100vw] h-[7vh] bg-fuchsia-50 fixed bottom-0 flex justify-center items-center gap-[5vw]">
            <button onClick={addTracks} className="w-[10vh] h-[4vh] bg-fuchsia-200 shadow-inner rounded-[5vh] font-medium hover:bg-fuchsia-400">ON</button>
            <button onClick={removeTracks} className="w-[10vh] h-[4vh] bg-fuchsia-200 shadow-inner rounded-[5vh] font-medium hover:bg-fuchsia-400">OFF</button>
        </div>
    </div>
}
export default Room;