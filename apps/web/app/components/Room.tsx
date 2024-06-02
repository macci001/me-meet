"use client"
import { useEffect, useState, useRef } from "react";
import { joinCallHandler, serverMessagesHandler } from "../handlers/SocketMessageHandlers";
import { handleAddTracks, handleEndCall, handleRemoveTracks } from "../handlers/buttonClickHandlers";
import ReceiverComponent from "./ReceiverCompnent";
import SenderComponent from "./SenderComponent";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const connectSocket = async (
    setSocket: any,
    pc: Array<PeerConnection>,
    setPc: any,
    roomName: string,
    setIsServerCrashed: any
) => {
    const userId:number = Number (sessionStorage.getItem("userId"));
    const socket = new WebSocket("wss://smartlearner.pro");
    await setSocket(socket);

    const roomNameFinal = !roomName ? "hello" : roomName;
    socket.onopen = () => {
        setIsServerCrashed(false);
        joinCallHandler(socket, roomNameFinal)
    };
    
    socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log(message.type);
        serverMessagesHandler(socket, pc, message, setPc);
    }

    socket.onerror = () => {
        console.log("some error in connection with ws.");
        socket.close();
    }

    socket.onclose = () => {
        setIsServerCrashed(true);
        pc.map((peer, index) => {
            const id = peer.userId;            
            sessionStorage.clear();
            if(id != Math.floor(id / 100)) {
                pc.splice(index, 1);
                setPc([...pc]);
                return;
            }
            const newPc:PeerConnection = {
                pc: new RTCPeerConnection(),
                track: [],
                userId: id
            }
            pc.splice(index, 1, newPc);
            sessionStorage.setItem("pc", JSON.stringify(pc));
        })
        setTimeout(() => {connectSocket(setSocket, pc, setPc, roomName, setIsServerCrashed)}, 2000);
    }
    await setSocket(socket);
}

const Room = ({roomName} : {roomName: string}) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<Array<PeerConnection>>([]);
    const [isServerCrashed, setIsServerCrashed] = useState<boolean>(false);
    const roomRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if(!socket) {
            sessionStorage.clear();
        }
        connectSocket(setSocket, pc, setPc, roomName, setIsServerCrashed);
    }, []);

    useEffect(()=> {
        sessionStorage.setItem("pc", JSON.stringify(pc));
        pc.map((peer) => {
            const peerPc = peer.pc;
            const userId:number = Number (sessionStorage.getItem("userId"));
            const roomId:number = Number (sessionStorage.getItem("roomId"));
            if(Math.floor(peer.userId / 100) == userId) {
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
    }, [pc, socket]);



    if (isServerCrashed) {
        return (<div className="h-[50vh] w-[100vw] bg-fuchsia-200 flex justify-center items-center">
            Error in Connecting to the server. Please Wait...
        </div>)
    }

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
            <button onClick={() => handleAddTracks(pc)} className="w-[10vh] h-[4vh] bg-fuchsia-200 shadow-inner rounded-[5vh] font-medium hover:bg-fuchsia-400">ON</button>
            <button onClick={() => handleRemoveTracks(pc, socket, "video")} className="w-[10vh] h-[4vh] bg-fuchsia-200 shadow-inner rounded-[5vh] font-medium hover:bg-fuchsia-400">OFF Vid</button>
            <button onClick={() => handleRemoveTracks(pc, socket, "audio")} className="w-[10vh] h-[4vh] bg-fuchsia-200 shadow-inner rounded-[5vh] font-medium hover:bg-fuchsia-400">OFF Aud</button>
            <button onClick={() => handleEndCall(pc, socket, router, setPc)} className="w-[10vh] h-[4vh] bg-fuchsia-200 shadow-inner rounded-[5vh] font-medium hover:bg-fuchsia-400">End Call</button>
        </div>
    </div>
}
export default Room;