import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchVenues, checkIn } from './venueService';
import { getArtieResponse } from './geminiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allowing all for development/production hybrid
app.use(cors());
app.use(express.json());

/**
 * @route GET /
 * @desc Welcome message
 */
app.get('/', (req, res) => {
    res.send(`
    <body style="background: #0f172a; color: #fbbf24; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
      <h1 style="font-size: 3rem; margin-bottom: 0;">OLYBARS BACKEND</h1>
      <p style="color: #94a3b8; font-size: 1.2rem;">Artie Relay is Online! 🍻</p>
      <a href="http://localhost:3000" style="margin-top: 2rem; padding: 1rem 2rem; background: #fbbf24; color: #000; text-decoration: none; font-weight: bold; border-radius: 0.5rem;">Launch Frontend</a>
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
        console.log('API Fetch: /api/venues requested');
        const venues = await fetchVenues();
        console.log(`API Fetch success: ${venues.length} venues found`);
        res.json(venues);
    } catch (error: any) {
        console.error('CRITICAL ERROR fetching venues:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
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
        console.error('Check-in failed:', error.message);
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
    } catch (error) {
        console.error('Failed to get Artie response:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`OlyBars Backend running on http://localhost:${PORT}`);
});
