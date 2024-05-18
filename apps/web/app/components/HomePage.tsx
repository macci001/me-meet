import { Dispatch, SetStateAction } from "react";

const HomePage = ({user, setInput, setIsRoomJoined} : {
    user: any,
    setInput: Dispatch<SetStateAction<string>>,
    setIsRoomJoined: Dispatch<SetStateAction<boolean>>
}) => {
    return (<div className="p-[3vw]">
        <div className="text-[4vw] font-extralight py-[1vw]">Hello, <span className="font-bold text-fuchsia-600">{user?.name}</span> !!!</div>  
        <div>
          <input onChange={(e) => (setInput(e.target.value))} className="bg-fuchsia-100 w-[70vw] h-[4vw] rounded-[1vw] shadow-inner text-[2vw] p-[2vw] text-fuchsia-600"></input>
          <button onClick={() => setIsRoomJoined(true)} className="bg-fuchsia-300 w-[13vw] h-[4vw] rounded-[1vw] ml-[2vw] shadow-inner text-[2vw] text-fuchsia-900 font-bold hover:text-fuchsia-300 hover:bg-fuchsia-900 hover:border-fuchsia-200">Join</button>
        </div>
    </div>)
}
export default HomePage;