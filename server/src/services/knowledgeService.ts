/**
 * KnowledgeService
 * Provides contextual information for events such as holidays and seasonal weather.
 */

export interface EventContext {
    holiday?: string;
    weatherOutlook: string;
    isMajorHoliday: boolean;
}

const HOLIDAYS: Record<string, string> = {
    '01-01': 'New Year\'s Day',
    '02-14': 'Valentine\'s Day',
    '03-17': 'St. Patrick\'s Day',
    '04-01': 'April Fool\'s Day',
    '05-05': 'Cinco de Mayo',
    '06-19': 'Juneteenth',
    '07-04': 'Independence Day',
    '07-15': 'Lakefair Week (Olympia Tradition)',
    '07-16': 'Lakefair Week (Olympia Tradition)',
    '07-17': 'Lakefair Week (Olympia Tradition)',
    '07-18': 'Lakefair Week (Olympia Tradition)',
    '07-19': 'Lakefair Week (Olympia Tradition)',
    '07-20': 'Lakefair Grand Finale',
    '10-31': 'Halloween',
    '11-11': 'Veterans Day',
    '12-24': 'Christmas Eve',
    '12-25': 'Christmas Day',
    '12-31': 'New Year\'s Eve',
};

const SEASONAL_WEATHER: Record<number, string> = {
    0: 'Chilly PNW winter, possible rain/snow. Advise dressing warm.', // Jan
    1: 'Cold and damp February vibes. Great for cozy bar nights.', // Feb
    2: 'Transitioning to spring, but still brisk and rainy.', // Mar
    3: 'April showers are here. Keep it indoors or under a heater.', // Apr
    4: 'Mild spring days, perfect for patio starts.', // May
    5: 'June Gloom is real, but the days are long.', // Jun
    6: 'Peak PNW Summer. Warm, dry, and ideal for cold drinks.', // Jul
    7: 'Hot August nights. Stay hydrated!', // Aug
    8: 'Crisp fall air arriving. Perfect for pumpkin ales soon.', // Sep
    9: 'Spooky October fog and rain. Classic Olympia atmosphere.', // Oct
    10: 'Dark and wet November. Time to hide in a booth.', // Nov
    11: 'Festive but freezing. Focus on warmth and safety.', // Dec
};

export class KnowledgeService {
    static getEventContext(dateStr: string): EventContext {
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const key = `${month}-${day}`;

        return {
            holiday: HOLIDAYS[key],
            weatherOutlook: SEASONAL_WEATHER[date.getMonth()] || 'Standard Olympia vibes.',
            isMajorHoliday: !!HOLIDAYS[key]
        };
    }

    static getFoodOrHolidayAlignment(venueType: string, dateStr: string): string | null {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // Special niche alignments
        if (venueType.toLowerCase().includes('mexican') || venueType.toLowerCase().includes('taco')) {
            if (month === 5 && day === 5) return 'Cinco de Mayo is peak for this venue!';
            if (month === 7 && day === 24) return 'National Tequila Day!';
        }

        if (venueType.toLowerCase().includes('pub') || venueType.toLowerCase().includes('irish')) {
            if (month === 3 && day === 17) return 'St. Patrick\'s Day is huge here.';
        }

        return null;
    }
}
