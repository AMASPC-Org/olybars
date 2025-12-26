import { getVenuePulse } from '../server/src/venueService';
import { db } from '../server/src/firebaseAdmin';

/**
 * Smoke test for Pulse Calculation
 */
async function verifyPulse() {
    const venueId = 'test-venue-' + Date.now();
    const now = Date.now();

    console.log(`[VERIFY] Testing Pulse for ${venueId}...`);

    try {
        // 1. Add mock signals with different timestamps
        const signals = [
            { id: 's1', timestamp: now - (5 * 60 * 1000) },   // 5m ago (1.0)
            { id: 's2', timestamp: now - (20 * 60 * 1000) },  // 20m ago (0.8)
            { id: 's3', timestamp: now - (45 * 60 * 1000) },  // 45m ago (0.5)
            { id: 's4', timestamp: now - (75 * 60 * 1000) },  // 75m ago (Expired)
        ];

        console.log('[VERIFY] Adding mock signals...');
        for (const s of signals) {
            await db.collection('signals').doc(s.id).set({
                venueId,
                type: 'check_in',
                timestamp: s.timestamp
            });
        }

        // 2. Calculate Pulse
        const pulse = await getVenuePulse(venueId);

        // Expected: 1.0 + 0.8 + 0.5 = 2.3 -> Round to 2
        console.log(`[RESULT] Calculated Pulse: ${pulse}`);

        if (pulse === 2) {
            console.log('[RESULT] STATUS: SUCCESS (Logic Verified)');
        } else {
            console.log(`[RESULT] STATUS: FAILURE (Expected 2, got ${pulse})`);
        }

        // 3. Cleanup
        for (const s of signals) {
            await db.collection('signals').doc(s.id).delete();
        }
        console.log('[VERIFY] Cleanup complete.');

    } catch (error) {
        console.error('[ERROR] Verification failed:', error);
    }
}

verifyPulse();
