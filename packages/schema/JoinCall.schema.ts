import {z} from "zod";

export const JoinCallRequest = z.object({
    type: z.string(),
    roomName: z.string(),
    getVideo: z.boolean(),
    getAudio: z.boolean()
});

export const JoinedCallResponse = z.object({
    type: z.string(),
    userId: z.number(),
    roomId: z.number()
})