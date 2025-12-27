import { z } from "zod";

export const createHubInputSchema = z.object({
  sourceType: z.enum(["text", "url", "file"]),
  textInput: z.string().optional(),
  urlInput: z.string().url().optional(),
  fileInput: z.string().optional(), // Represents a file path or reference
});

export const updateHubInputSchema = z.object({
  hubId: z.string(),
  finalPillars: z.array(z.string()),
});

