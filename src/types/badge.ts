export interface Badge {
    id: string;
    name: string;
    description: string;
    icon?: string;
    points: number;
    criteria: {
        type: 'checkin_set' | 'count';
        venueIds?: string[];
        count?: number;
        category?: string;
        isHistoricalAnchor?: boolean;
        timeWindowDays?: number;
    };
    secret?: boolean;
}
