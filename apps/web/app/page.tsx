"use client"
import { useSession } from "next-auth/react";
import { useState } from "react";
import HomePage from "./components/HomePage";
import { redirect } from "next/navigation";

export default function Page(): JSX.Element {
  const [input, setInput] = useState<string>("");
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const session = useSession();
  const user = session.data?.user;

  if(isRoomJoined && input) {
    redirect("/room/" + input);
  }

  return (
    <div>
      <HomePage user={user} setInput={setInput} setIsRoomJoined={setIsRoomJoined}/>
    </div>
  );
}
