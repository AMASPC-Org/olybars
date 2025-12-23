import { z } from 'zod';

export const BarSchema = z.object({
    name: z.string(),
    location: z.object({ lat: z.number(), lng: z.number() }),
    vibe: z.array(z.string()).describe("Tags like 'Cozy', 'Divey', 'Upscale', 'Loud'"),
    happyHour: z.object({
        active: z.boolean(),
        details: z.string().optional()
    })
});

export const BarQuerySchema = z.object({
    query: z.string().describe("The user's search query or intent"),
    vibe: z.string().optional().describe("Specific vibe requested if any"),
    location: z.string().optional().describe("Location context if provided")
});

export const BarRecommendationSchema = z.object({
    bars: z.array(BarSchema).describe("List of recommended bars"),
    reasoning: z.string().describe("Why these bars were recommended")
});
