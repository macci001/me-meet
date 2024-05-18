"use client"
import { useSession, signIn, signOut } from "next-auth/react"

const Header = () => {
    const session = useSession();
    return (
        <div>
            {
                session.status == "authenticated" ? <button onClick={() => signOut()}>SignOut</button> : <button onClick={() => signIn()}>SignIn</button>
            }
        </div>
    )
}
export default Header;