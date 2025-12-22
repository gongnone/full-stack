import { z } from "zod";

export const createClientInputSchema = z.object({
  name: z.string().min(1, "Client name cannot be empty."),
});
