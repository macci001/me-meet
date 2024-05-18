"use client"
import { useSession, signIn, signOut } from "next-auth/react"

const Header = () => {
    const session = useSession();
    return (
        <div className="h-[7vh] bg-fuchsia-50 flex justify-between items-center p-[2vw] w-[100vw] shadow-inner">
            <div>ICON</div>
            <div>ME MEET</div>
            {
                session.status == "authenticated" ? <button onClick={() => signOut()}>SignOut</button> : <button onClick={() => signIn()}>SignIn</button>
            }
        </div>
    )
}
export default Header;