import {z} from "zod";

export const IceCandidate = z.object({
    toUserId: z.number(),
    fromUserId: z.number(),
    roomId: z.number(),
    candidate: z.custom<RTCIceCandidate>(),
    type: z.string()
});
