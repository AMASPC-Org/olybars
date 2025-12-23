import { z } from 'zod';
import { ai } from '../genkit';

const EventSchema = z.object({
    title: z.string(),
    date: z.string(),
    venue: z.string(),
});

const EventInputSchema = z.object({
    date: z.string().optional().describe('Date to filter by YYYY-MM-DD'),
});

export const eventsTool = ai.defineTool(
    {
        name: 'eventsTool',
        description: 'Find upcoming events in Olympia.',
        inputSchema: EventInputSchema,
        outputSchema: z.array(EventSchema),
    },
    async ({ date }: z.infer<typeof EventInputSchema>) => {
        return [
            { title: 'Trivia Night', date: '2025-12-25', venue: 'Well 80' }
        ];
    }
);
