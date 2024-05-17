import {z} from "zod";

export const CreateOffer = z.object({
    type: z.string(),
    fromUserId: z.number(),
    toUserId: z.number(),
    roomId: z.number(),
    sdp: z.custom<RTCSessionDescriptionInit>()
});