import { z } from "zod";

export const createGenerationSchema = z.object({
    prompt: z.string().min(10, "Prompt must be at least 10 characters long"),
    type: z.enum(["tweet", "image", "video_script", "offer_architect"]),
    model: z.string().optional().default("gpt-4o"),
});

export type CreateGenerationInput = z.infer<typeof createGenerationSchema>;
