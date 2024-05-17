"use client"
import { useEffect, useRef, useState } from "react";

const Receiver = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const receivedVideoComponent = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({type: "receiver"}));
        }
        startReceiving(socket);
    }, []);

    const startReceiving = (socket: WebSocket) => {
        if(!socket){
            return;
        }

        const pc = new RTCPeerConnection();
        setPc(pc);

        pc.ontrack = (event) => {
            if(!receivedVideoComponent || !receivedVideoComponent.current)return;
            receivedVideoComponent.current.srcObject = new MediaStream([event.track]);
            receivedVideoComponent.current.play();
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if(message.type == "createOffer") {
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({type: "createAnswer", sdp: answer}));
                    })
                })
            } else if(message.type == "iceCandidate") {
                pc.addIceCandidate(message.candidate);
            }
        }

        pc.onicecandidate = async (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({type: "iceCandidate", candidate: event.candidate}));
            }
        }
    } 


    return (<video className="w-full h-full bg-green-200" ref={receivedVideoComponent}>
        receiver
    </video>)
}
export default Receiver;