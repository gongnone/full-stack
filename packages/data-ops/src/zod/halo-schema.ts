import { z } from "zod";

export const HaloResearchSchema = z.object({
    avatar: z.object({
        name: z.string().describe("A catchy name for the avatar, e.g., 'Frustrated Frank'"),
        demographics: z.string(),
        psychographics: z.string(),
    }),
    painPoints: z.array(z.string()).describe("The 'Bleeding Neck' problems"),
    competitorGaps: z.array(z.string()).describe("What competitors are missing"),
    marketDesire: z.string().describe("The core desire/outcome they want"),
    verbatimQuotes: z.array(z.string()).describe("Real quotes from forums/reviews"),
    suggestedAngles: z.array(z.string()).optional(),
    sources: z.array(z.object({
        url: z.string(),
        title: z.string(),
        content: z.string()
    })).optional(),
});

export type HaloResearchData = z.infer<typeof HaloResearchSchema>;
