import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: {label: "username", type: "text"},
                password: {label: "password", type: "password"}
            },
            async authorize(credentials, req){
                const userName = credentials?.username;
                const password = credentials?.password;
                if (userName == process.env.USER1 && password == process.env.PASSWORD1) {
                    const user = {id: "1", name: "name1"}
                    return user;
                }
                if (userName == process.env.USER2 && password == process.env.PASSWORD2) {
                    const user = {id: "2", name: "name2"};
                    return user;
                }
                return null;
            }
        })
    ],
    secret: process.env.NEXT_APP_SECRET
}
export default NextAuth(authOptions);