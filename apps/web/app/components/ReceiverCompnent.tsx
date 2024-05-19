"use client"

const ReceiverComponent = ({id} : {
    id: string
}) => {
    return (<div>
        <video className="w-[150vh] h-[75vh] bg-fuchsia-200 rounded-[2vw] shadow-inner" id={id}></video>
    </div>)
}
export default ReceiverComponent;