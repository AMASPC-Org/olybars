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
    homeBase: z.string().optional(),
    leaguePreferences: z.record(z.string(), z.any()).optional(),
    hasCompletedMakerSurvey: z.boolean().optional(),
    role: z.string().optional(), // We will gate this in the logic
});

export const ChatRequestSchema = z.object({
    question: z.string().min(1).max(1000),
    history: z.array(z.object({
        role: z.enum(['user', 'model']),
        parts: z.array(z.object({ text: z.string() }))
    })).optional(),
    userId: z.string().min(1),
    _hp_id: z.string().optional(), // Honeypot
});
