"use client"
import { useSession } from "next-auth/react";
import { useState } from "react";
import Room from "./components/Room";

export default function Page(): JSX.Element {
  const [input, setInput] = useState<string>("");
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const session = useSession();
  const user = session.data?.user;
  return (
    <div>
      {
        isRoomJoined && input ? <>
          <Room roomName={input}></Room>
        </> : <>
          <span>Hello {user?.name}</span>  
          <div>
            <input onChange={(e) => (setInput(e.target.value))} className="bg-red-200"></input>
            <button onClick={() => setIsRoomJoined(true)}>Join</button>
          </div>
        </> 
      }
    </div>
  );
}
