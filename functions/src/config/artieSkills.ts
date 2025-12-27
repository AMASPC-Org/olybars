export interface SkillParam {
    name: string;
    description: string;
    required: boolean;
}

export type SkillCategory = 'PROMOTION' | 'PROFILE' | 'CONTENT_ENGINE' | 'IDEATION';

export interface ArtieSkill {
    id: string;
    name: string;
    description: string;
    category: SkillCategory;
    protocol: string;
    params: SkillParam[];
    actionTemplate: string;
}

export const ARTIE_SKILLS: Record<string, ArtieSkill> = {
    update_flash_deal: {
        id: 'update_flash_deal',
        name: 'Flash Deal',
        description: 'Post a limited-time special offer.',
        category: 'PROMOTION',
        protocol: `
Collect and confirm these 3 details:
1. Title (Punchy name, e.g., "$3 Wells")
2. Description (What is included, e.g., "All wells, limit 2")
3. Duration (How long it lasts, e.g., "60 minutes")
COMPLIANCE: Strictly forbid language implying rapid/excessive consumption (e.g., "Chug", "Bottomless", "Get Hammered"). Provide a legal "Artie Pivot" if necessary.`,
        params: [
            { name: 'summary', description: 'Title of the deal', required: true },
            { name: 'details', description: 'Description of the deal', required: true },
            { name: 'price', description: 'Price or discount', required: false },
            { name: 'duration', description: 'Duration in minutes or hours (Artie will translate to timestamp)', required: true }
        ],
        actionTemplate: '[ACTION]: {"skill": "update_flash_deal", "params": {"summary": "{{summary}}", "details": "{{details}}", "price": "{{price}}", "duration": "{{duration}}"}}'
    },
    update_hours: {
        id: 'update_hours',
        name: 'Update Hours',
        description: 'Update the regular hours of operation.',
        category: 'PROFILE',
        protocol: `
Collect the new hours for the venue. 
Be sure to clarify if it is for specific days or the entire week.
Confirm the new hours string (e.g., "Mon-Fri 4pm-10pm, Sat-Sun 12pm-11pm").`,
        params: [
            { name: 'hours', description: 'The formatted hours string', required: true }
        ],
        actionTemplate: '[ACTION]: {"skill": "update_hours", "params": {"hours": "{{hours}}"}}'
    },
    update_happy_hour: {
        id: 'update_happy_hour',
        name: 'Happy Hour',
        description: 'Update the happy hour specials and times.',
        category: 'PROMOTION',
        protocol: `
Collect the happy hour details:
1. Days/Times (e.g., "Daily 3pm-6pm")
2. Specials (e.g., "$1 off drafts, $5 snacks")
Confirm both before generating action.`,
        params: [
            { name: 'schedule', description: 'Days and times of happy hour', required: true },
            { name: 'specials', description: 'Summary of deals', required: true }
        ],
        actionTemplate: '[ACTION]: {"skill": "update_happy_hour", "params": {"schedule": "{{schedule}}", "specials": "{{specials}}"}}'
    },
    add_event: {
        id: 'add_event',
        name: 'Add Event',
        description: 'Add an upcoming event like Trivia, Live Music, or Karaoke.',
        category: 'PROMOTION',
        protocol: `
Collect event details:
1. Type (Trivia, Karaoke, Music, etc.)
2. Day/Time (e.g., "Tomorrow at 7pm")
3. Description (Optional details)
Confirm the event details.
COMPLIANCE: Ensure the event does not reward points for alcohol purchase and avoids "Anti-Volume" marketing.`,
        params: [
            { name: 'type', description: 'Type of event', required: true },
            { name: 'time', description: 'When it starts', required: true },
            { name: 'description', description: 'Additional info', required: false }
        ],
        actionTemplate: '[ACTION]: {"skill": "add_event", "params": {"type": "{{type}}", "time": "{{time}}", "description": "{{description}}"}}'
    },
    update_profile: {
        id: 'update_profile',
        name: 'Update Profile',
        description: 'Update website, social handles, or venue description.',
        category: 'PROFILE',
        protocol: `
Identify which fields the user wants to update:
1. Website
2. Instagram / Facebook handles
3. Description / Bio
Confirm the specific changes before generating the action.`,
        params: [
            { name: 'website', description: 'Venue website URL', required: false },
            { name: 'instagram', description: 'Instagram handle', required: false },
            { name: 'facebook', description: 'Facebook page URL or handle', required: false },
            { name: 'description', description: 'Venue description/bio', required: false }
        ],
        actionTemplate: '[ACTION]: {"skill": "update_profile", "params": {"website": "{{website}}", "instagram": "{{instagram}}", "facebook": "{{facebook}}", "description": "{{description}}"}}'
    },
    draft_social_post: {
        id: 'draft_social_post',
        name: 'Draft Social Post',
        description: 'Generate marketing copy for social media.',
        category: 'CONTENT_ENGINE',
        protocol: `
1. Ask what the post is about (Event, Deal, Vibe).
2. Generate a punchy, engaging caption.
3. COMPLIANCE: Must adhere to LCB rules (Safe ride mention, no chugging).
4. Present the draft for the user to "Save to Drafts".`,
        params: [
            { name: 'topic', description: 'What the post is about', required: true },
            { name: 'copy', description: 'The generated caption text', required: true },
            { name: 'platform', description: 'Instagram, Facebook, etc.', required: false }
        ],
        actionTemplate: '[ACTION]: {"skill": "draft_social_post", "params": {"topic": "{{topic}}", "copy": "{{copy}}", "platform": "{{platform}}"}}'
    },
    ideate_event: {
        id: 'ideate_event',
        name: 'Event Ideation',
        description: 'Brainstorm creative event ideas for the venue.',
        category: 'IDEATION',
        protocol: `
1. Research the venue's vibe.
2. Provide 2-3 creative event concepts (e.g., "90s Arcade Night", "Local Maker Pop-up").
3. Include a brief description for each.
4. If the user likes one, generate a draft for them.`,
        params: [
            { name: 'concepts', description: 'The brainstormed ideas', required: true }
        ],
        actionTemplate: '[ACTION]: {"skill": "ideate_event", "params": {"concepts": "{{concepts}}"}}'
    }
};
