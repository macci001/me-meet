import {z} from "zod";

export const CloseConnection = z.object({
    type: z.string(),
    toUserId: z.number(),
    fromUserId: z.number(),
    roomId: z.number()
});