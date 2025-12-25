console.log("Starting OlyBars Server...");
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fetchVenues, checkIn } from './venueService';
import { isAiBot, getBotName } from './utils/botDetector';

dotenv.config();

// Load functions/.env as fallback for AI keys
const functionsEnvPath = path.resolve(process.cwd(), 'functions/.env');
if (fs.existsSync(functionsEnvPath)) {
    dotenv.config({ path: functionsEnvPath });
}

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

app.use(async (req, res, next) => {
    const start = Date.now();
    const correlation_id = req.header('x-correlation-id') || `req-${Math.random().toString(36).substring(2, 11)}`;
    const userAgent = req.get('user-agent') || '';

    // AI Bot Tracking
    if (isAiBot(userAgent)) {
        const botName = getBotName(userAgent);
        const resource = req.url;

        // Non-blocking log to Firestore
        (async () => {
            try {
                const { db } = await import('./firebaseAdmin');
                await db.collection('ai_access_logs').add({
                    botName,
                    userAgent,
                    resource,
                    timestamp: new Date().toISOString(),
                    method: req.method,
                    ip: req.ip || req.header('x-forwarded-for') || 'unknown'
                });
                log('INFO', `[AI_BOT_DETECTED] ${botName} accessed ${resource}`);
            } catch (err) {
                console.error('[AI_ERROR] Failed to log bot access:', err);
            }
        })();
    }

    res.on('finish', () => {
        const latencyMs = Date.now() - start;
        log('INFO', `${req.method} ${req.url} - ${res.statusCode}`, {
            correlation_id,
            route: req.route?.path || req.url,
            status: res.statusCode,
            latencyMs,
            userAgent,
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
        res.setHeader('Cache-Control', 'public, max-age=30'); // Cache for 30s
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
    const { venueId, userId, lat, lng, verificationMethod } = req.body;

    if (!venueId || !userId || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Missing required check-in data' });
    }

    try {
        const result = await checkIn(venueId, userId, lat, lng, verificationMethod);
        res.json(result);
    } catch (error: any) {
        log('WARNING', 'Check-in failed', { venueId, userId, error: error.message });
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route POST /api/play/check-in
 * @desc Log an amenity-specific "Play" check-in
 */
app.post('/api/play/check-in', async (req, res) => {
    const { venueId, userId, amenityId } = req.body;

    if (!venueId || !userId || !amenityId) {
        return res.status(400).json({ error: 'Missing required play data' });
    }

    try {
        const { checkInAmenity } = await import('./venueService');
        const result = await checkInAmenity(venueId, userId, amenityId);
        res.json(result);
    } catch (error: any) {
        log('WARNING', 'Play check-in failed', { venueId, userId, amenityId, error: error.message });
        res.status(400).json({ error: error.message });
    }
});



/**
 * @route POST /api/requests
 * @desc Handle Admin Requests (Contact, League, Maker)
 * @params type, payload, contactEmail
 */
app.post('/api/requests', async (req: express.Request, res: express.Response) => {
    const { type, payload, contactEmail } = req.body;

    if (!type || !payload) {
        return res.status(400).json({ error: 'Missing type or payload' });
    }

    try {
        const requestData = {
            type,
            payload,
            contactEmail: contactEmail || 'anonymous',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
        };

        log('INFO', `[ADMIN_REQUEST] received: ${type}`, requestData);

        // Simulate Email Notification
        console.log(`\n📨 --- EMAIL SIMULATION ---`);
        console.log(`To: ryan@amaspc.com`);
        console.log(`Subject: New ${type} Request`);
        console.log(`From: Artie (System)`);
        console.log(`Body:`, JSON.stringify(requestData, null, 2));
        console.log(`---------------------------\n`);

        res.json({ success: true, message: 'Request received and logged.' });
    } catch (error: any) {
        log('ERROR', 'Failed to process request', { error: error.message });
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
 * @route PATCH /api/venues/:id
 * @desc Update general venue information (Listing management)
 */
app.patch('/api/venues/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const { updateVenue } = await import('./venueService');
        const result = await updateVenue(id, updates);
        res.json(result);
    } catch (error: any) {
        log('ERROR', 'Failed to update venue listing', { venueId: id, error: error.message });
        res.status(500).json({ error: error.message || 'Internal Server Error' });
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
 * @route PATCH /api/users/:uid
 * @desc Update user profile data with business logic (e.g. handle cooldown)
 */
app.patch('/api/users/:uid', async (req, res) => {
    const { uid } = req.params;
    const { handle, email, phone, favoriteDrink, homeBase, leaguePreferences, hasCompletedMakerSurvey } = req.body;

    try {
        const { db } = await import('./firebaseAdmin');
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const updates: any = {
            updatedAt: new Date().toISOString()
        };

        if (phone !== undefined) updates.phone = phone;
        if (favoriteDrink !== undefined) updates.favoriteDrink = favoriteDrink;
        if (homeBase !== undefined) updates.homeBase = homeBase;
        if (leaguePreferences !== undefined) updates.leaguePreferences = leaguePreferences;
        if (email !== undefined) updates.email = email;
        if (hasCompletedMakerSurvey !== undefined) updates.hasCompletedMakerSurvey = hasCompletedMakerSurvey;

        // Handle cooldown logic
        if (handle !== undefined && handle !== userData?.handle) {
            const lastChanged = userData?.handleLastChanged || 0;
            const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
            const now = Date.now();

            // Super-admins/Admin bypass (Ryan's email)
            const isPrivileged = userData?.role === 'super-admin' || userData?.email === 'ryan@amaspc.com';

            if ((now - lastChanged) < thirtyDaysInMs && !isPrivileged) {
                const daysLeft = Math.ceil((thirtyDaysInMs - (now - lastChanged)) / (24 * 60 * 60 * 1000));
                return res.status(429).json({ error: `Handle lock active. Wait ${daysLeft} days.` });
            }

            // [SECURITY] Reserve TheCommish handle
            if (handle.toLowerCase() === '@thecommish' && !isPrivileged) {
                return res.status(403).json({ error: 'This handle is reserved for League Administration.' });
            }

            updates.handle = handle;
            updates.handleLastChanged = now;
        }

        await userRef.update(updates);
        log('INFO', 'User profile updated', { uid, updates });
        res.json({ success: true, updates });
    } catch (error: any) {
        log('ERROR', 'Failed to update user profile', { uid, error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route POST /api/admin/setup-super
 * @desc Promote a user to Super-Admin role (Secure established)
 */
app.post('/api/admin/setup-super', async (req, res) => {
    const { email, secretKey, password } = req.body;
    const MASTER_KEY = process.env.MASTER_SETUP_KEY || 'OLY_MASTER_2025';

    if (secretKey !== MASTER_KEY) {
        return res.status(403).json({ error: 'Invalid master setup key' });
    }

    try {
        const { db, auth } = await import('./firebaseAdmin');
        let user;
        try {
            user = await auth.getUserByEmail(email);
        } catch (error) {
            return res.status(404).json({ error: `User ${email} not found in Auth.` });
        }

        const uid = user.uid;

        // 1. Update Auth (Password if provided)
        if (password) {
            await auth.updateUser(uid, { password });
        }

        // 2. Update Firestore
        await db.collection('users').doc(uid).set({
            role: 'super-admin', // Legacy
            systemRole: 'admin', // New RBAC
            isAdmin: true,
            status: 'active',
            updatedAt: new Date().toISOString()
        }, { merge: true });

        log('INFO', 'User promoted to Super-Admin', { uid, email });
        res.json({ success: true, message: `User ${email} is now a SUPER-ADMIN.` });
    } catch (error: any) {
        log('ERROR', 'Super-Admin promotion failed', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/activity/recent', async (req, res) => {
    try {
        const { db } = await import('./firebaseAdmin'); // Import db here
        const limit = parseInt(req.query.limit as string) || 20;
        const snapshot = await db.collection('activity_logs')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- ARTIE AI CHAT GATEWAY ---
/**
 * @route POST /api/chat
 * @desc Artie AI Chat Relay (Direct Backend Path)
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { history, question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        // Import the logic dynamically to keep dependencies clean
        const { artieChatLogic } = await import('../../functions/src/flows/artieChat');
        const result = await artieChatLogic({ history: history || [], question });

        res.json({ data: result });
    } catch (error: any) {
        log('ERROR', 'Artie Local Relay Failure', { error: error.message });
        res.status(500).json({ error: `Artie is having a moment: ${error.message}` });
    }
});

/**
 * @route GET /api/ai/access-logs
 * @desc Fetch recent AI bot activity
 */
app.get('/api/ai/access-logs', async (req, res) => {
    try {
        const { db } = await import('./firebaseAdmin');
        const snapshot = await db.collection('ai_access_logs')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(logs);
    } catch (error: any) {
        log('ERROR', 'Failed to fetch AI access logs', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route GET /api/venues/:id/semantic
 * @desc Get Gemini-enriched semantic metadata for a venue
 */
app.get('/api/venues/:id/semantic', async (req, res) => {
    const { id } = req.params;
    try {
        const { db } = await import('./firebaseAdmin');
        const venueDoc = await db.collection('venues').doc(id).get();
        if (!venueDoc.exists) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        const venue = venueDoc.data();

        // Dynamically import Gemini Service
        const { GeminiService } = await import('../../functions/src/services/geminiService');
        const gemini = new GeminiService();

        const prompt = `You are an SEO & AI Authority specialist for OlyBars.
        Analyze this venue and produce a structured semantic profile for AI agents.
        Venue: ${venue.name}
        Type: ${venue.type}
        Vibe: ${venue.vibe}
        Lore: ${venue.originStory}
        Insider: ${venue.insiderVibe}
        
        Output ONLY a JSON object with:
        "keywords": [top 5 niche keywords],
        "mood": [3 mood descriptors],
        "era": [dominant historical era signature],
        "botContext": [1-sentence summary for LLM ingestion]`;

        const response = await gemini.generateArtieResponse('gemini-2.0-flash', [
            { role: 'user', parts: [{ text: prompt }] }
        ], 0.3);

        const semanticData = JSON.parse(response || '{}');
        res.json(semanticData);
    } catch (error: any) {
        log('ERROR', 'Semantic Enrichment Failed', { venueId: id, error: error.message });
        res.status(500).json({ error: 'Failed to enrich venue context.' });
    }
});

app.listen(PORT, () => {
    log('INFO', `OlyBars Backend running on http://localhost:${PORT}`);
});
