import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
import { fetchVenues, checkIn } from './venueService';
import { isAiBot, getBotName } from './utils/botDetector';
import { verifyToken, requireRole, verifyAppCheck, identifyUser } from './middleware/authMiddleware';
import {
    CheckInSchema,
    PlayCheckInSchema,
    AdminRequestSchema,
    UserUpdateSchema,
    ChatRequestSchema,
    VenueUpdateSchema,
    VenueOnboardSchema,
    AppEventSchema
} from './utils/validation';

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Cloud Run load balancer)
const port = config.PORT;

// [SECURITY] Standard headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

/**
 * Global Rate Limiter
 * 100 requests per 15 minutes per IP.
 */
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
});

/**
 * Artie Chat Rate Limiter
 * Limits based on user role.
 */
const artieRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: (req: any) => {
        const role = req.user?.role;
        if (role === 'super-admin' || role === 'admin') return 1000;
        if (role === 'owner' || role === 'manager') return 500;
        if (role === 'user') return 50; // Authenticated league player
        return 5; // Guest Limit
    },
    keyGenerator: (req: any) => req.user?.uid || req.ip,
    message: { error: 'Artie is taking a short break. Come back in an hour!' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
});

const v1Router = express.Router();
const v2Router = express.Router();

/**
 * Versioned Rate Limiters
 */
v1Router.use(globalRateLimiter);
v2Router.use(globalRateLimiter);

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://olybars-dev.web.app',
    'https://olybars.web.app',
    'https://olybars.com',
    'https://www.olybars.com'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

/**
 * Honeypot Middleware
 * Rejects requests with non-empty honeypot field.
 */
const verifyHoneypot = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.body._hp_id) {
        log('WARNING', '[HONEYPOT_TRIGGERED] Potential bot submission blocked.', { ip: req.ip });
        return res.status(403).json({ error: 'Beep boop. Request denied.' });
    }
    next();
};

/**
 * Aggressive Bot Blocker Middleware
 * Identifies and blocks high-aggression/low-value bots on sensitive routes.
 */
const blockAggressiveBots = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userAgent = req.get('user-agent') || '';
    if (isAiBot(userAgent)) {
        const botName = getBotName(userAgent);
        const AGGRESSIVE_BOTS = ['GPTBOT', 'CCBOT', 'BYTESPIDER', 'PETALBOT', 'DIFFBOT'];

        if (AGGRESSIVE_BOTS.includes(botName)) {
            log('WARNING', `[ABUSE_PREVENTED] Blocked aggressive bot: ${botName}`, { url: req.url });
            return res.status(403).json({ error: 'This resource is reserved for humans. Cheers!' });
        }
    }
    next();
};

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
    res.json({
        status: 'popping',
        timestamp: Date.now(),
        env: config.NODE_ENV,
        version: '1.0.0-hardened'
    });
});

/**
 * @route GET /api/health/artie
 * @desc Artie Health Check (Authenticated)
 */
v1Router.get('/health/artie', async (req, res) => {
    const internalToken = req.header('X-Internal-Token');
    const expectedToken = config.INTERNAL_HEALTH_TOKEN;

    if (!internalToken || internalToken !== expectedToken) {
        return res.status(403).json({ error: 'Artie says: Access Denied. Proper credentials required.' });
    }

    try {
        const { GeminiService } = await import('../../functions/src/services/geminiService');
        const gemini = new GeminiService();
        // Minimal ping call (triage is cheap)
        const triage = await gemini.getTriage('Health Check Ping');
        res.json({
            status: 'healthy',
            artieBrain: 'connected',
            triageResult: triage,
            timestamp: Date.now()
        });
    } catch (error: any) {
        log('ERROR', 'Artie Health Check Failed', { error: error.message });
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

/**
 * @route GET /api/venues
 * @desc Fetch sorted venues from Firestore
 */
v1Router.get('/venues', async (req, res) => {
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
v1Router.post('/check-in', verifyAppCheck, verifyToken, async (req, res) => {
    const validation = CheckInSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid check-in data', details: validation.error.format() });
    }
    const { venueId, lat, lng, verificationMethod } = validation.data;
    const userId = (req as any).user.uid;

    try {
        const result = await checkIn(venueId, userId, lat, lng, verificationMethod);
        res.json(result);
    } catch (error: any) {
        log('WARNING', 'Check-in failed', { venueId, userId, error: error.message });
        res.status(400).json({ error: error.message });
    }
});

v1Router.post('/play/check-in', verifyToken, async (req, res) => {
    const validation = PlayCheckInSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid play data', details: validation.error.format() });
    }
    const { venueId, amenityId } = validation.data;
    const userId = (req as any).user.uid;

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
v1Router.post('/requests', verifyAppCheck, verifyHoneypot, blockAggressiveBots, async (req: express.Request, res: express.Response) => {
    const validation = AdminRequestSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid request data', details: validation.error.format() });
    }
    const { type, payload, contactEmail } = validation.data;

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
v1Router.post('/activity', verifyToken, async (req, res) => {
    const userId = (req as any).user.uid;
    const { type, venueId, points, hasConsent, metadata } = req.body;

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
v1Router.get('/activity', async (req, res) => {
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
 * @route GET /api/partners/reports/hourly
 * @desc Fetch hourly activity reports for a venue
 */
v1Router.get('/partners/reports/hourly', verifyToken, requireRole(['admin', 'super-admin', 'owner', 'manager']), async (req, res) => {
    const { venueId, day } = req.query;
    if (!venueId) return res.status(400).json({ error: 'venueId is required' });

    try {
        const { getPartnerHourlyReport } = await import('./venueService');
        const report = await getPartnerHourlyReport(venueId as string, day ? parseInt(day as string) : undefined);
        res.json(report);
    } catch (error: any) {
        log('ERROR', 'Failed to fetch hourly report', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route GET /api/users/me/history
 * @desc Fetch point history for the authenticated user
 */
v1Router.get('/users/me/history', verifyToken, async (req, res) => {
    const userId = (req as any).user.uid;
    try {
        const { getUserPointHistory } = await import('./venueService');
        const history = await getUserPointHistory(userId);
        res.json(history);
    } catch (error: any) {
        log('ERROR', 'Failed to fetch user history', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route PATCH /api/venues/:id
 * @desc Update general venue information (Listing management)
 */
v1Router.patch('/venues/:id', verifyToken, requireRole(['admin', 'super-admin', 'owner', 'manager', 'user', 'PLAYER']), async (req, res) => {
    const { id } = req.params;
    const validation = VenueUpdateSchema.safeParse(req.body.updates);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid updates data', details: validation.error.format() });
    }
    const updates = validation.data;
    const requestingUserId = (req as any).user.uid;

    try {
        const { updateVenue } = await import('./venueService');
        const result = await updateVenue(id, updates, requestingUserId);
        res.json(result);
    } catch (error: any) {
        log('ERROR', 'Failed to update venue listing', { venueId: id, error: error.message });
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

/**
 * @route POST /api/venues/:id/sync-google
 * @desc Sync venue details with Google Places API
 */
v1Router.post('/venues/:id/sync-google', verifyToken, requireRole(['admin', 'super-admin']), async (req, res) => {
    const { id } = req.params;
    const { googlePlaceId } = req.body;
    const requestingUserId = (req as any).user.uid;

    try {
        const { syncVenueWithGoogle } = await import('./venueService');
        const result = await syncVenueWithGoogle(id, googlePlaceId);
        res.json(result);
    } catch (error: any) {
        log('ERROR', 'Failed to sync venue with Google', { venueId: id, error: error.message });
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

/**
 * @route GET /api/venues/:id/pulse
 * @desc Fetch real-time Pulse score for a venue
 */
v1Router.get('/venues/:id/pulse', async (req, res) => {
    const { id } = req.params;
    try {
        const { getVenuePulse } = await import('./venueService');
        const pulse = await getVenuePulse(id);
        res.json({ pulse });
    } catch (error: any) {
        log('ERROR', 'Failed to fetch venue pulse', { venueId: id, error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route GET /api/venues/:id/insights
 * @desc Fetch proactive AI insights for a venue
 */
v1Router.get('/venues/:id/insights', verifyToken, requireRole(['admin', 'super-admin', 'owner', 'manager']), async (req, res) => {
    const { id } = req.params;
    try {
        const { generateVenueInsights } = await import('./venueService');
        const insights = await generateVenueInsights(id);
        res.json(insights);
    } catch (error: any) {
        log('ERROR', 'Failed to fetch venue insights', { venueId: id, error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route GET /api/venues/check-claim
 * @desc Check if a venue is already claimed by Google Place ID
 */
v1Router.get('/venues/check-claim', async (req, res) => {
    const { googlePlaceId } = req.query;
    if (!googlePlaceId) return res.status(400).json({ error: 'Missing googlePlaceId' });

    try {
        const { checkVenueClaimStatus } = await import('./venueService');
        const status = await checkVenueClaimStatus(googlePlaceId as string);
        res.json(status);
    } catch (error: any) {
        log('ERROR', 'Failed to check venue claim status', { googlePlaceId, error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route POST /api/partners/onboard
 * @desc Claim a venue and sync with Google
 */
v1Router.post('/partners/onboard', verifyToken, async (req: any, res) => {
    const validation = VenueOnboardSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid onboarding data', details: validation.error.format() });
    }
    const { googlePlaceId } = validation.data;

    try {
        const { onboardVenue } = await import('./venueService');
        const result = await onboardVenue(googlePlaceId, req.user.uid);
        res.json(result);
    } catch (error: any) {
        log('ERROR', 'Failed to onboard partner venue', { googlePlaceId, userId: req.user.uid, error: error.message });
        res.status(400).json({ error: error.message || 'Internal Server Error' });
    }
});

/**
 * @route PATCH /api/venues/:id/photos/:photoId
 * @desc Update photo approval status
 */
v1Router.patch('/venues/:id/photos/:photoId', verifyToken, requireRole(['admin', 'super-admin']), async (req, res) => {
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
 * @route GET /api/venues/:id/members
 * @desc Fetch all members of a venue
 */
v1Router.get('/venues/:id/members', verifyToken, requireRole(['admin', 'super-admin', 'owner', 'manager']), async (req, res) => {
    const { id } = req.params;
    try {
        const { getVenueMembers } = await import('./venueService');
        const members = await getVenueMembers(id);
        res.json(members);
    } catch (error: any) {
        log('ERROR', 'Failed to fetch venue members', { venueId: id, error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route POST /api/venues/:id/members
 * @desc Add a new member to a venue
 */
v1Router.post('/venues/:id/members', verifyToken, requireRole(['admin', 'super-admin', 'owner', 'manager']), async (req, res) => {
    const { id } = req.params;
    const { email, role } = req.body;
    const requestingUserId = (req as any).user.uid;

    if (!email || !role) {
        return res.status(400).json({ error: 'Missing email or role' });
    }

    try {
        const { addVenueMember } = await import('./venueService');
        const result = await addVenueMember(id, email, role, requestingUserId);
        res.json(result);
    } catch (error: any) {
        log('ERROR', 'Failed to add venue member', { venueId: id, email, error: error.message });
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route DELETE /api/venues/:id/members/:memberId
 * @desc Remove a member from a venue
 */
v1Router.delete('/venues/:id/members/:memberId', verifyToken, requireRole(['admin', 'super-admin', 'owner', 'manager']), async (req, res) => {
    const { id: venueId, memberId } = req.params;
    const requestingUserId = (req as any).user.uid;

    try {
        const { removeVenueMember } = await import('./venueService');
        const result = await removeVenueMember(venueId, memberId, requestingUserId);
        res.json(result);
    } catch (error: any) {
        log('ERROR', 'Failed to remove venue member', { venueId, memberId, error: error.message });
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route POST /api/client-errors
 * @desc Receive and log client-side errors
 */
v1Router.post('/client-errors', (req, res) => {
    const payload = req.body;
    log('ERROR', `CLIENT ERROR: ${payload.message}`, {
        ...payload,
        source: 'client-collector'
    });
    res.status(204).send();
});

/**
 * @route GET /api/config/maps-key
 * @desc Get the restricted Google Maps BROWSER key for the frontend
 */
v1Router.get('/config/maps-key', (req, res) => {
    // Only return the browser key (public/restricted)
    const key = config.VITE_GOOGLE_BROWSER_KEY;
    if (!key) return res.status(500).json({ error: 'Maps Browser Key not configured' });

    res.json({ key });
});

/**
 * @route GET /api/places/search
 * @desc Proxy for Google Places Autocomplete
 */
v1Router.get('/places/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const { getAutocompletePredictions } = await import('./utils/placesService');
        const predictions = await getAutocompletePredictions(q as string);
        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: 'Places search failed' });
    }
});

/**
 * @route GET /api/places/details/:placeId
 * @desc Proxy for Google Places Details
 */
v1Router.get('/places/details/:placeId', async (req, res) => {
    const { placeId } = req.params;
    try {
        const { getPlaceDetails } = await import('./utils/placesService');
        const details = await getPlaceDetails(placeId);
        if (!details) return res.status(404).json({ error: 'Place not found' });
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: 'Place details failed' });
    }
});

/**
 * @route PATCH /api/users/:uid
 * @desc Update user profile data with business logic (e.g. handle cooldown)
 */
v1Router.patch('/users/:uid', verifyToken, async (req, res) => {
    const { uid } = req.params;
    const requestingUser = (req as any).user;

    // Check if user is updating their own profile or is an admin
    if (requestingUser.uid !== uid && requestingUser.role !== 'super-admin' && requestingUser.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: You can only update your own profile.' });
    }

    const validation = UserUpdateSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid update data', details: validation.error.format() });
    }

    const { handle, email, phone, favoriteDrink, favoriteDrinks, homeBase, playerGamePreferences, hasCompletedMakerSurvey, role } = validation.data;

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
        if (favoriteDrinks !== undefined) updates.favoriteDrinks = favoriteDrinks;
        if (homeBase !== undefined) updates.homeBase = homeBase;
        if (playerGamePreferences !== undefined) updates.playerGamePreferences = playerGamePreferences;
        if (email !== undefined) updates.email = email;
        if (hasCompletedMakerSurvey !== undefined) updates.hasCompletedMakerSurvey = hasCompletedMakerSurvey;

        // [SECURITY REMEDIATION L-01] Role change lockdown
        if (role !== undefined) {
            if (requestingUser.role !== 'super-admin' && requestingUser.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden: You cannot change your own role.' });
            }
            updates.role = role;
        }

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
v1Router.post('/admin/setup-super', async (req, res) => {
    const { email, secretKey, password } = req.body;
    const MASTER_KEY = process.env.MASTER_SETUP_KEY;

    if (!MASTER_KEY || secretKey !== MASTER_KEY) {
        log('WARNING', '[SECURITY] Invalid master setup attempt', { email, ip: req.ip });
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

v1Router.get('/activity/recent', async (req, res) => {
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

/**
 * @route GET /api/events
 * @desc Fetch events (approved or user's own)
 */
v1Router.get('/events', async (req, res) => {
    const { venueId, status } = req.query;
    try {
        const { db } = await import('./firebaseAdmin');
        let query: any = db.collection('events');

        if (venueId) {
            query = query.where('venueId', '==', venueId);
        }
        if (status) {
            query = query.where('status', '==', status);
        } else {
            // Default: show only approved events publicly
            query = query.where('status', '==', 'approved');
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const events = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        res.json(events);
    } catch (error: any) {
        log('ERROR', 'Failed to fetch events', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route POST /api/events
 * @desc Submit an event (Public or Authenticated)
 */
v1Router.post('/events', verifyHoneypot, async (req, res) => {
    const validation = AppEventSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Invalid event data', details: validation.error.format() });
    }

    try {
        const { db } = await import('./firebaseAdmin');
        const eventData = {
            ...validation.data,
            status: 'pending', // Always start as pending
            submittedBy: (req as any).user?.uid || 'guest',
            createdAt: Date.now(),
        };

        const docRef = await db.collection('events').add(eventData);
        log('INFO', `[EVENT_SUBMITTED] Event ${docRef.id} received.`);
        res.json({ success: true, id: docRef.id });
    } catch (error: any) {
        log('ERROR', 'Failed to submit event', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route PATCH /api/events/:id
 * @desc Manage event status or details
 */
v1Router.patch('/events/:id', verifyToken, requireRole(['admin', 'super-admin', 'owner', 'manager']), async (req, res) => {
    const { id } = req.params;
    const { status, title, type, date, time, description } = req.body;

    try {
        const { db } = await import('./firebaseAdmin');
        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const eventData = eventDoc.data();
        const user = (req as any).user;

        // AUTH CHECK: Must be admin or owner/manager of the venue
        if (user.role !== 'admin' && user.role !== 'super-admin') {
            const venueDoc = await db.collection('venues').doc(eventData?.venueId).get();
            const venue = venueDoc.data();
            if (venue?.ownerId !== user.uid && !venue?.managerIds?.includes(user.uid)) {
                return res.status(403).json({ error: 'Forbidden: You do not have permission to manage this venue\'s events.' });
            }
        }

        const updates: any = { updatedAt: Date.now() };
        if (status) updates.status = status;
        if (title) updates.title = title;
        if (type) updates.type = type;
        if (date) updates.date = date;
        if (time) updates.time = time;
        if (description) updates.description = description;

        await eventRef.update(updates);
        log('INFO', `[EVENT_UPDATED] Event ${id} updated status: ${status}`);
        res.json({ success: true });
    } catch (error: any) {
        log('ERROR', 'Failed to update event', { eventId: id, error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @route DELETE /api/events/:id
 * @desc Remove an event
 */
v1Router.delete('/events/:id', verifyToken, requireRole(['admin', 'super-admin', 'owner', 'manager']), async (req, res) => {
    const { id } = req.params;

    try {
        const { db } = await import('./firebaseAdmin');
        const eventRef = db.collection('events').doc(id);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const eventData = eventDoc.data();
        const user = (req as any).user;

        // AUTH CHECK
        if (user.role !== 'admin' && user.role !== 'super-admin') {
            const venueDoc = await db.collection('venues').doc(eventData?.venueId).get();
            const venue = venueDoc.data();
            if (venue?.ownerId !== user.uid && !venue?.managerIds?.includes(user.uid)) {
                return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this venue\'s events.' });
            }
        }

        await eventRef.delete();
        log('INFO', `[EVENT_DELETED] Event ${id} removed.`);
        res.json({ success: true });
    } catch (error: any) {
        log('ERROR', 'Failed to delete event', { eventId: id, error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- ARTIE AI CHAT GATEWAY ---

/**
 * @route POST /v1/chat
 * @desc Artie AI Chat Relay (Direct Backend Path)
 */
v1Router.post('/chat', identifyUser, artieRateLimiter, verifyHoneypot, blockAggressiveBots, async (req, res) => {
    try {
        const validation = ChatRequestSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Invalid chat data', details: validation.error.format() });
        }
        const { history, question, userId } = validation.data;

        // [SECURITY REMEDIATION A-02]
        // Fetch real role from DB instead of trusting request body
        let realRole = 'user';
        if (userId) {
            const { db } = await import('./firebaseAdmin');
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            realRole = userData?.role || 'user';
        }

        // Import the logic dynamically to keep dependencies clean
        const { artieChatLogic } = await import('../../functions/src/flows/artieChat');
        const result = await artieChatLogic({ history: history || [], question, userId, userRole: realRole });

        // Check if result is a stream (it will be for successful generatations)
        if (typeof result !== 'string' && (result as any).stream) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');

            let fullResponse = '';
            let rationaleFound = false;

            for await (const chunk of (result as any).stream) {
                const text = chunk.text();
                if (text) {
                    fullResponse += text;

                    // [RATIONALE LOGGING]
                    // If we haven't found the rationale yet, and we see the [RATIONALE] tag, 
                    // we log it but don't write it to the response yet if we want to hide it.
                    // However, to keep streaming fast, we'll just write everything but strip the tag in the frontend
                    // OR we buffer only the rationale part.

                    // Cleaner approach: If text starts with [RATIONALE]:, buffer until first newline, then log, then continue streaming normally.
                    if (!rationaleFound && fullResponse.includes('[RATIONALE]:')) {
                        const parts = fullResponse.split('\n');
                        for (const part of parts) {
                            if (part.startsWith('[RATIONALE]:')) {
                                log('INFO', '[ARTIE_RATIONALE]', { rationale: part.replace('[RATIONALE]:', '').trim(), question });
                                rationaleFound = true;
                                // We don't res.write the rationale line
                            } else if (rationaleFound) {
                                res.write(part + (parts.indexOf(part) < parts.length - 1 ? '\n' : ''));
                            }
                        }
                    } else if (rationaleFound) {
                        res.write(text);
                    } else if (!fullResponse.includes('[RATIONALE]') && fullResponse.length > 50) {
                        // Safety fallback: if no rationale found after 50 chars, just start streaming
                        rationaleFound = true;
                        res.write(fullResponse);
                    }
                }
            }
            res.end();
        } else {
            // Fallback for strings (triage rejections, safety, etc.)
            res.json({ data: result });
        }
    } catch (error: any) {
        log('ERROR', 'Artie Local Relay Failure', { error: error.message });
        res.status(500).json({ error: `Artie is having a moment: ${error.message}` });
    }
});

/**
 * @route GET /api/ai/access-logs
 * @desc Fetch recent AI bot activity
 */
v1Router.get('/ai/access-logs', verifyToken, requireRole(['admin', 'super-admin']), async (req, res) => {
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
v1Router.get('/venues/:id/semantic', async (req, res) => {
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

/**
 * @route POST /api/ai/generate-description
 * @desc Generate an AI event description based on context
 */
v1Router.post('/ai/generate-description', async (req, res) => {
    const { venueId, type, date, time } = req.body;

    if (!venueId || !type || !date || !time) {
        return res.status(400).json({ error: 'Missing required context fields (venueId, type, date, time).' });
    }

    try {
        const { db } = await import('./firebaseAdmin');
        const { KnowledgeService } = await import('./services/knowledgeService');
        const { GeminiService } = await import('../../functions/src/services/geminiService');

        // 1. Fetch Venue Data
        const venueDoc = await db.collection('venues').doc(venueId).get();
        if (!venueDoc.exists) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        const venue = venueDoc.data();

        // 2. Fetch Relevant Deals (Happy Hour/Flash Deals)
        // For simplicity, we'll just check if the venue has registered deals
        // In a real scenario, we might filter by time, but for now we provide the list to Artie.
        const deals = venue?.deals || [];

        // 3. Get Knowledge Context (Holidays/Weather)
        const context = KnowledgeService.getEventContext(date);
        const foodAlignment = KnowledgeService.getFoodOrHolidayAlignment(venue.type || '', date);

        // 4. Generate with Artie
        const gemini = new GeminiService();
        const description = await gemini.generateEventDescription({
            venueName: venue.name,
            venueType: venue.type,
            eventType: type,
            date,
            time,
            weather: context.weatherOutlook,
            holiday: context.holiday ? `${context.holiday}${foodAlignment ? ` (${foodAlignment})` : ''}` : foodAlignment || undefined,
            deals
        });

        res.json({ description });
    } catch (error: any) {
        log('ERROR', 'AI Description Generation Failed', { error: error.message });
        res.status(500).json({ error: 'Failed to generate description.' });
    }
});

/**
 * @route POST /api/ai/analyze-event
 * @desc Analyze an event for quality and compliance
 */
v1Router.post('/ai/analyze-event', verifyToken, async (req, res) => {
    const event = req.body;

    if (!event || !event.title || !event.date) {
        return res.status(400).json({ error: 'Missing required event fields for analysis.' });
    }

    try {
        const { GeminiService } = await import('../../functions/src/services/geminiService');
        const gemini = new GeminiService();

        const analysis = await gemini.analyzeEvent(event);
        res.json(analysis);
    } catch (error: any) {
        log('ERROR', 'Event Analysis Failed', { error: error.message });
        res.status(500).json({ error: 'Failed to analyze event.' });
    }
});

// --- MOUNT ROUTERS ---
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
app.use('/api', v1Router); // Fallback for legacy frontend


// Flash Deal Activator (Lazy Cron)
setInterval(async () => {
    try {
        const { syncFlashDeals } = await import('./venueService');
        await syncFlashDeals();
    } catch (e) {
        console.error('[ACTIVATOR] Failed to sync flash deals:', e);
    }
}, 60000); // Check every minute

app.listen(port, () => {
    log('INFO', `Flash Boarding... OlyBars Server running on port ${port} in ${config.NODE_ENV} mode.`);
});
