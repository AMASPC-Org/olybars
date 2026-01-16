import { SkillContext } from '../../types/skill';

/**
 * SKILL: Visitor Concierge (Artie)
 * This is the public-facing side of the AI, helping users find fun in Olympia.
 */
export const handleVisitorQuery = async (query: string, ctx: SkillContext) => {
    // Placeholder for visitor logic
    // Eventually: Find Trivia, Join Waitlist, What's the Wifi?, etc.
    ctx.addUserMessage(query);
    ctx.setIsLoading(true);

    // Simulate thinking
    setTimeout(() => {
        ctx.addSchmidtResponse("Artie here! I'm still learning how to help visitors find the best fun in Oly. Stay tuned!", [
            { id: '1', label: 'Back to Schmidt', value: 'START_SESSION', icon: '🤖' }
        ]);
        ctx.setIsLoading(false);
    }, 1000);
};
