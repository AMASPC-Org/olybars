import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchVenues, checkIn } from './venueService';
import { getArtieResponse } from './geminiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * Structured Logging Helper for Google Cloud
 */
const log = (severity: string, message: string, payload: any = {}) => {
    const logEntry = {
        severity,
        message,
        timestamp: new Date().toISOString(),
        ...payload,
    };
    console.log(JSON.stringify(logEntry));
};

app.use((req, res, next) => {
    const start = Date.now();
    const correlation_id = req.header('x-correlation-id') || `req-${Math.random().toString(36).substring(2, 11)}`;

    res.on('finish', () => {
        const latencyMs = Date.now() - start;
        log('INFO', `${req.method} ${req.url} - ${res.statusCode}`, {
            correlation_id,
            route: req.route?.path || req.url,
            status: res.statusCode,
            latencyMs,
            userAgent: req.get('user-agent'),
        });
    });
    next();
});

/**
 * @route GET /
 * @desc Welcome message
 */
app.get('/', (req, res) => {
    res.send(`
    <body style="background: #0f172a; color: #fbbf24; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
      <h1 style="font-size: 3rem; margin-bottom: 0;">OLYBARS BACKEND</h1>
      <p style="color: #94a3b8; font-size: 1.2rem;">Artie Relay is Online! 🍻</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="margin-top: 2rem; padding: 1rem 2rem; background: #fbbf24; color: #000; text-decoration: none; font-weight: bold; border-radius: 0.5rem;">Launch Frontend</a>
    </body>
  `);
});

/**
 * @route GET /health
 * @desc API Health check
 */
app.get('/health', (req, res) => {
    res.json({ status: 'popping', timestamp: Date.now() });
});

/**
 * @route GET /api/venues
 * @desc Fetch sorted venues from Firestore
 */
app.get('/api/venues', async (req, res) => {
    try {
        const venues = await fetchVenues();
        res.json(venues);
    } catch (error: any) {
        log('ERROR', 'CRITICAL ERROR fetching venues', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route POST /api/check-in
 * @desc Verify location and log a check-in signal
 */
app.post('/api/check-in', async (req, res) => {
    const { venueId, userId, lat, lng } = req.body;

    if (!venueId || !userId || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Missing required check-in data' });
    }

    try {
        const result = await checkIn(venueId, userId, lat, lng);
        res.json(result);
    } catch (error: any) {
        log('WARNING', 'Check-in failed', { venueId, userId, error: error.message });
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route POST /api/chat
 * @desc Artie AI Relay endpoint
 */
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await getArtieResponse(message, history || []);
        res.json({ text: response });
    } catch (error: any) {
        log('ERROR', 'Failed to get Artie response', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route POST /api/activity
 * @desc Log user activity and award points
 */
app.post('/api/activity', async (req, res) => {
    const { userId, type, venueId, points, hasConsent, metadata } = req.body;

    if (!userId || !type || points === undefined) {
        return res.status(400).json({ error: 'Missing required activity data' });
    }

    try {
        const { logUserActivity } = await import('./venueService');
        const result = await logUserActivity({ userId, type, venueId, points, hasConsent, metadata });
        res.json(result);
    } catch (error: any) {
        log('ERROR', 'Failed to log activity', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route GET /api/activity
 * @desc Fetch aggregated activity stats for a venue
 */
app.get('/api/activity', async (req, res) => {
    const { venueId, period } = req.query;

    if (!venueId) {
        return res.status(400).json({ error: 'venueId is required' });
    }

    try {
        const { getActivityStats } = await import('./venueService');
        const stats = await getActivityStats(venueId as string, period as string || 'week');
        res.json(stats);
    } catch (error: any) {
        log('ERROR', 'Failed to fetch activity stats', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route PATCH /api/venues/:id/photos/:photoId
 * @desc Update photo approval status
 */
app.patch('/api/venues/:id/photos/:photoId', async (req, res) => {
    const { id: venueId, photoId } = req.params;
    const { isApprovedForFeed, isApprovedForSocial } = req.body;

    try {
        const { updatePhotoStatus } = await import('./venueService');
        const result = await updatePhotoStatus(venueId, photoId, { isApprovedForFeed, isApprovedForSocial });
        res.json(result);
    } catch (error: any) {
        log('ERROR', 'Failed to update photo status', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route POST /api/client-errors
 * @desc Receive and log client-side errors
 */
app.post('/api/client-errors', (req, res) => {
    const payload = req.body;
    log('ERROR', `CLIENT ERROR: ${payload.message}`, {
        ...payload,
        source: 'client-collector'
    });
    res.status(204).send();
});

/**
 * @route POST /api/admin/promote
 * @desc Promote a user to Admin role (Dev/MVP access)
 */
app.post('/api/admin/promote', async (req, res) => {
    const { email, secretKey } = req.body;

    // Master key for initial setup (in real prod this would be in Secret Manager)
    if (secretKey !== 'OLY_MASTER_2025') {
        return res.status(403).json({ error: 'Invalid master key' });
    }

    try {
        const { db, auth } = await import('./firebaseAdmin');
        const userRecord = await auth.getUserByEmail(email);
        const uid = userRecord.uid;

        await db.collection('users').doc(uid).set({
            role: 'admin',
            stats: { seasonPoints: 99999, lifetimeCheckins: 0, currentStreak: 0 }
        }, { merge: true });

        log('INFO', 'User promoted to Admin', { uid, email });
        res.json({ success: true, message: `User ${email} is now an ADMIN.` });
    } catch (error: any) {
        log('ERROR', 'Promotion failed', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    log('INFO', `OlyBars Backend running on http://localhost:${PORT}`);
});
