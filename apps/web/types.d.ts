type JoinCallRequest = import("zod").TypeOf<typeof import("@repo/schema/JoinCallSchema")["JoinCallRequest"]>;
type JoinedCallResponse = import("zod").TypeOf<typeof import("@repo/schema/JoinCallSchema")["JoinedCallResponse"]>;
type CreateAnswer = import("zod").TypeOf<typeof import("@repo/schema/CreateAnswer")["CreateAnswer"]>;
type requestSender = import("zod").TypeOf<typeof import("@repo/schema/SendRequest")["SendRequest"]>;
type PeerConnection = {pc: RTCPeerConnection, userId: number, track: Array<MediaStreamTrack>};