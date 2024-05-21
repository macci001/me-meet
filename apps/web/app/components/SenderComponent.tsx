"use client"
import { useSession } from "next-auth/react";

const SenderComponent = ({id} : {id: string}) => {
    const session = useSession();
    const userName = session.data?.user?.name;
    return (<div className="fixed bottom-[8vh] right-[1vw]">
        <div className="absolute right-[1vh] top-[1vh] bg-fuchsia-200 p-0.5 rounded-md font-medium opacity-75 text-fucnsia-400">{userName}</div>
        <video className="w-[30vmin] h-[20vmax] md:w-[30vmax] md:h-[15vmax] 2xl:w[14-vmax] 2xl:h-[7-vmax] bg-fuchsia-100  rounded-[1vw] shadow-inner" id={id} key={"sender"} style={{transform: "rotateY(180deg)"}}>Sender</video>
    </div>)
}
export default SenderComponent;