type JoinCallRequest = import("zod").TypeOf<typeof import("@repo/schema/JoinCall.schema")["JoinCallRequest"]>;
type JoinedCallResponse = import("zod").TypeOf<typeof import("@repo/schema/JoinCall.schema")["JoinedCallResponse"]>;
type CreateOffer = import("zod").TypeOf<typeof import("@repo/schema/CreateOffer.schema")["CreateOffer"]>;
type CreateAnswer = import("zod").TypeOf<typeof import("@repo/schema/CreateAnswer.schema")["CreateAnswer"]>;
type requestSender = import("zod").TypeOf<typeof import("@repo/schema/SendRequest.schema")["SendRequest"]>;
type IceCandidate = import("zod").TypeOf<typeof import("@repo/schema/IceCandidate.schema")["IceCandidate"]>;
type PeerConnection = {pc: RTCPeerConnection, userId: number};