import {z} from "zod";

export const CreateAnswer = z.object({
    type: z.string(),
    toUserId: z.number(),
    fromUserId: z.number(),
    roomId: z.number(),
    sdp: z.custom<RTCSessionDescriptionInit>()
});