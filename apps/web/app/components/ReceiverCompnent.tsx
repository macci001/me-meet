"use client"

const ReceiverComponent = ({videoId, audioId} : {
    videoId: string,
    audioId: string
}) => {
    return (<div>
        <video className="w-[150vh] h-[75vh] bg-fuchsia-200 rounded-[2vw] shadow-inner" id={videoId}></video>
        <audio className="hidden" id={audioId}></audio>
    </div>)
}
export default ReceiverComponent;