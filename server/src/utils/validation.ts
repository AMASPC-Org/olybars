import { z } from 'zod';

export const CheckInSchema = z.object({
    venueId: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
    verificationMethod: z.enum(['gps', 'qr']).optional(),
});

export const PlayCheckInSchema = z.object({
    venueId: z.string().min(1),
    amenityId: z.string().min(1),
});

export const AdminRequestSchema = z.object({
    type: z.enum(['CONTACT', 'LEAGUE_JOIN', 'MAKER_ONBOARD', 'ADMIN_SETUP']),
    payload: z.record(z.string(), z.any()),
    contactEmail: z.string().email().optional(),
    _hp_id: z.string().optional(), // Honeypot
});

export const UserUpdateSchema = z.object({
    handle: z.string().regex(/^@[a-zA-Z0-9_]{3,15}$/, 'Invalid handle format').optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    favoriteDrink: z.string().optional(),
    favoriteDrinks: z.array(z.string()).optional(),
    homeBase: z.string().optional(),
    playerGamePreferences: z.array(z.string()).optional(),
    hasCompletedMakerSurvey: z.boolean().optional(),
    role: z.string().optional(), // We will gate this in the logic
});

export const ChatRequestSchema = z.object({
    question: z.string().min(1).max(1000),
    history: z.array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string()
    })).optional(),
    userId: z.string().optional(),
    _hp_id: z.string().optional(), // Honeypot
});

export const VenueUpdateSchema = z.object({
    name: z.string().optional(),
    nicknames: z.array(z.string()).optional(),
    address: z.string().optional(),
    description: z.string().optional(),
    hours: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    amenityDetails: z.array(z.object({
        id: z.string(),
        name: z.string(),
        count: z.number(),
        available: z.number().optional(),
        isLeaguePartner: z.boolean().optional(),
        artieLore: z.string().optional(),
    })).optional(),
    vibe: z.string().optional(),
    vibeDefault: z.enum(['CHILL', 'LIVELY', 'BUZZING']).optional(),
    assets: z.record(z.string(), z.boolean()).optional(),
    originStory: z.string().optional(),
    insiderVibe: z.string().optional(),
    geoLoop: z.enum(['Downtown_Walkable', 'Warehouse_Tumwater', 'Destination_Quest']).optional(),
    isLowCapacity: z.boolean().optional(),
    isSoberFriendly: z.boolean().optional(),
    makerType: z.enum(['Brewery', 'Distillery', 'Cidery', 'Winery']).optional(),
    physicalRoom: z.boolean().optional(),
    carryingMakers: z.array(z.string()).optional(),
    isLocalMaker: z.boolean().optional(),
    isVerifiedMaker: z.boolean().optional(),
    localScore: z.number().min(0).max(100).optional(),
    isPaidLeagueMember: z.boolean().optional(),
    leagueEvent: z.enum(['karaoke', 'trivia', 'arcade', 'events', 'openmic', 'bingo', 'live_music', 'pool', 'darts']).nullable().optional(),
    triviaTime: z.string().optional(),
    deal: z.string().optional(),
    dealEndsIn: z.number().optional(),
    checkIns: z.number().optional(),
    isVisible: z.boolean().optional(),
    isActive: z.boolean().optional(),
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional(),
    managersCanAddUsers: z.boolean().optional(),
});

export const VenueOnboardSchema = z.object({
    googlePlaceId: z.string().min(1),
});
export const AppEventSchema = z.object({
    venueId: z.string().min(1),
    venueName: z.string().min(1),
    title: z.string().min(1).max(100),
    type: z.enum(['karaoke', 'trivia', 'live_music', 'bingo', 'openmic', 'other']),
    date: z.string().min(1),
    time: z.string().min(1),
    description: z.string().max(500).optional(),
    points: z.number().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    isLeagueEvent: z.boolean().optional(),
});
