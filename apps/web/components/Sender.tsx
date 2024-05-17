"use client"
import { useState, useEffect, useRef } from "react";

const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const videoElement = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({type: "sender"}));
        }
    }, []);

    const initiateConnection = async () => {
        if (!socket) {
            alert("no socket found");
            return;
        }
        const pc = new RTCPeerConnection();
        setPc(pc);

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type == "createAnswer") {
                await pc?.setRemoteDescription(message.sdp);
            } else if(message.type == "iceCandidate") {
                await pc?.addIceCandidate(message.candidate);
            }
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({type: "iceCandidate", candidate: event.candidate}));
            }
        }

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({type: "createOffer", sdp: offer}));
        }

        getCameraStream(pc);
    }

    const getCameraStream = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getDisplayMedia({video: true}).then((stream) => {
            if(videoElement != null && videoElement.current!=null) {
                videoElement.current.srcObject = stream;
                videoElement.current.play();
            }
            
            stream.getTracks().forEach((track) => {
                pc?.addTrack(track);
            });
        })
    }

    return (<video className="w-full h-full bg-red-200" onClick={initiateConnection} id="videoElement" ref={videoElement}>
        Sender
    </video>)
}
export default Sender;