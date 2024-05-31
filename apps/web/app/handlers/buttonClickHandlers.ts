export const handleRemoveTracks = (pc: Array<PeerConnection>, socket: WebSocket | null, type: "audio" | "video") => {
    if(!socket || pc.length == 0) {
        return;
    }
    const userId:number = Number (sessionStorage.getItem("userId"));
    const roomId:number = Number (sessionStorage.getItem("roomId"));
    
    const senderElement = document.getElementById("senderVideoRef") as unknown as HTMLVideoElement;
    if(type=="video" && senderElement != null) {
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

export const handleAddTracks = async (pc: Array<PeerConnection>) => {
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

export const handleEndCall = (pc: Array<PeerConnection>, socket: WebSocket | null, router: any, setPc: any) => {
    if(socket == null) {
        return;
    }
    const userId:number = Number (sessionStorage.getItem("userId"));
    const roomId:number = Number (sessionStorage.getItem("roomId"));
    
    handleRemoveTracks(pc, socket, "video");
    handleRemoveTracks(pc, socket, "audio");
    
    pc.map((peer) => {
        const peerPc = peer.pc;
        const pcId = peer.userId;
        
        //close all the connection where userId is sender
        if(Math.floor(pcId / 100) == userId) {
            socket?.send(JSON.stringify({type: "closeConnection", toUserId: (pcId % 100), fromUserId: userId, roomId: roomId}));
            peerPc.close();
        }
    })
    setPc([]);
    sessionStorage.setItem("pc", JSON.stringify(pc));

    router.push("/");
}