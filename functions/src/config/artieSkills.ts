export interface SkillParam {
    name: string;
    description: string;
    required: boolean;
}

export interface ArtieSkill {
    id: string;
    name: string;
    description: string;
    protocol: string;
    params: SkillParam[];
    actionTemplate: string;
}

export const ARTIE_SKILLS: Record<string, ArtieSkill> = {
    update_flash_deal: {
        id: 'update_flash_deal',
        name: 'Flash Deal',
        description: 'Post a limited-time special offer.',
        protocol: `
Collect and confirm these 3 details:
1. Title (Punchy name, e.g., "$3 Wells")
2. Description (What is included, e.g., "All wells, limit 2")
3. Duration (How long it lasts, e.g., "For the next hour")`,
        params: [
            { name: 'summary', description: 'Title of the deal', required: true },
            { name: 'details', description: 'Description of the deal', required: true },
            { name: 'price', description: 'Price or discount', required: false },
            { name: 'duration', description: 'How long it lasts', required: true }
        ],
        actionTemplate: '[ACTION]: {"skill": "update_flash_deal", "params": {"summary": "{{summary}}", "details": "{{details}}", "price": "{{price}}", "duration": "{{duration}}"}}'
    },
    update_hours: {
        id: 'update_hours',
        name: 'Update Hours',
        description: 'Update the regular hours of operation.',
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
        protocol: `
Collect event details:
1. Type (Trivia, Karaoke, Music, etc.)
2. Day/Time (e.g., "Tomorrow at 7pm")
3. Description (Optional details)
Confirm the event details.`,
        params: [
            { name: 'type', description: 'Type of event', required: true },
            { name: 'time', description: 'When it starts', required: true },
            { name: 'description', description: 'Additional info', required: false }
        ],
        actionTemplate: '[ACTION]: {"skill": "add_event", "params": {"type": "{{type}}", "time": "{{time}}", "description": "{{description}}"}}'
    }
};
