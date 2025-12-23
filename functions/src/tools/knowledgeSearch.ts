import { z } from 'zod';
import { ai } from '../genkit';
import kb from '../knowledgeBase.json';

const FAQItemSchema = z.object({
    question: z.string(),
    answer: z.string(),
});

const KnowledgeInputSchema = z.object({
    query: z.string().describe('The question or keywords to search in the OlyBars Playbook/FAQ.'),
});

export const knowledgeSearch = ai.defineTool(
    {
        name: 'knowledgeSearch',
        description: 'Search the OlyBars Playbook for rules, app help, and league info.',
        inputSchema: KnowledgeInputSchema,
        outputSchema: z.array(FAQItemSchema),
    },
    async ({ query }: z.infer<typeof KnowledgeInputSchema>) => {
        try {
            const normalizedQuery = query.toLowerCase();
            const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

            return kb.faq.filter(item => {
                const combinedText = `${item.question} ${item.answer}`.toLowerCase();
                if (combinedText.includes(normalizedQuery)) return true;
                return queryWords.some(word => combinedText.includes(word));
            }).slice(0, 3);
        } catch (error) {
            console.error("Knowledge search failed:", error);
            return [];
        }
    }
);
