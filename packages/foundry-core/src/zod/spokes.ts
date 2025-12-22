import { z } from "zod";

export const generateSpokesInputSchema = z.object({
  hubId: z.string(),
  platforms: z.array(z.enum(['twitter', 'linkedin', 'tiktok', 'instagram_carousel', 'youtube_script'])).optional(), // Optional: specify platforms to generate for
});

export const evaluateSpokeInputSchema = z.object({
  spokeId: z.string(),
});

