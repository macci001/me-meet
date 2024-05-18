"use client"
import { useSession } from "next-auth/react";
import { useState } from "react";
import Room from "./components/Room";
import HomePage from "./components/HomePage";

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
          <HomePage user={user} setInput={setInput} setIsRoomJoined={setIsRoomJoined}/>
        </> 
      }
    </div>
  );
}
