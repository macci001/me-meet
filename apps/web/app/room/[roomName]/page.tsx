"use client"
import Room from "../../components/Room";
const Page = ({params}: {params: {roomName: string}}) => {
    return <Room roomName={params.roomName}/>;
}
export default Page;
