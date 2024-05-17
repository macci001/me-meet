import {z} from "zod";

export const SendRequest = z.object({
    type: z.string(),
    fromUserId: z.number(),
    toUserId: z.number(),
    roomId: z.number()
});