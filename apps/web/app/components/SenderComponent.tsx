"use client"
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

const SenderComponent = ({id, roomRef} : {id: string, roomRef: any}) => {
    const session = useSession();
    const userName = session.data?.user?.name;
    return (
    <motion.div className="fixed bottom-[8vh] right-[1vw]" drag dragConstraints={roomRef} whileTap={{scale:1.2}} dragTransition={{bounceStiffness: 100, bounceDamping: 100}} dragMomentum={false}>
        <div className="absolute right-[1vh] top-[1vh] bg-fuchsia-200 p-0.5 rounded-md font-medium opacity-75 text-fucnsia-400">{userName}</div>
        <video className="w-[30vmin] h-[20vmax] md:w-[30vmax] md:h-[15vmax] 2xl:w[14-vmax] 2xl:h-[7-vmax] bg-fuchsia-100  rounded-[1vw] shadow-inner" id={id} key={"sender"} style={{transform: "rotateY(180deg)"}}>Sender</video>
    </motion.div>)
}
export default SenderComponent;