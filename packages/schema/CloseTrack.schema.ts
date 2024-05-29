import {z} from "zod";

export const CloseTrackSchema = z.object({
    type: z.string(),
    toUserId: z.number(),
    fromUserId: z.number(),
    roomId: z.number(),
    trackType: z.string()
})