import Sender from "../../components/Sender";
import Receiver from "../../components/Receiver";

const vc = () => {
    return <div>
        <div className="w-[40vw] h-[23vw] m-10">
            <Sender />
        </div>
        <div className="w-[40vw] h-[23vw] m-10">
            <Receiver />
        </div>
    </div>
}
export default vc;