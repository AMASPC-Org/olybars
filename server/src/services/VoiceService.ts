import twilio from 'twilio';
import { config } from '../appConfig/config.js';
import { db } from '../firebaseAdmin.js';

const TWILIO_SID = config.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = config.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = config.TWILIO_PHONE_NUMBER;

const client = TWILIO_SID && TWILIO_AUTH ? twilio(TWILIO_SID, TWILIO_AUTH) : null;

export const VoiceService = {
    /**
     * Initiates a verification call to a venue.
     */
    async initiateVerificationCall(venueId: string, phoneNumber: string, venueName: string): Promise<{ code: string }> {
        // 1. Generate a 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // 2. Store the code in Firestore with a 10-minute expiry
        await db.collection('phoneVerifications').doc(venueId).set({
            code,
            phoneNumber,
            expiresAt: Date.now() + 10 * 60 * 1000,
            status: 'pending',
            venueId,
            createdAt: Date.now()
        });

        // 3. Trigger the call if Twilio is configured
        if (client && TWILIO_FROM) {
            try {
                const twiml = new twilio.twiml.VoiceResponse();
                twiml.say({ voice: 'Polly.Amy' }, `Hello, this is Artie from Oly Bars. We are verifying the induction for ${venueName}.`);
                twiml.pause({ length: 1 });
                twiml.say({ voice: 'Polly.Amy' }, `To authorize this claim, please note the current verification code.`);
                twiml.pause({ length: 1 });
                // Speak code slowly
                code.split('').forEach(digit => {
                    twiml.say({ voice: 'Polly.Amy' }, digit);
                    twiml.pause({ length: 1 });
                });
                twiml.say({ voice: 'Polly.Amy' }, `Again, the code is ${code.split('').join(' ')}.`);
                twiml.pause({ length: 1 });
                twiml.say({ voice: 'Polly.Amy' }, `Please enter this code on your induction screen. Goodbye.`);

                await client.calls.create({
                    twiml: twiml.toString(),
                    to: phoneNumber,
                    from: TWILIO_FROM
                });
                console.log(`[VOICE_SERVICE] Call initiated for ${venueId} at ${phoneNumber}`);
            } catch (error) {
                console.error('[VOICE_SERVICE] Twilio call failed:', error);
                throw new Error('TWILIO_CALL_FAILED');
            }
        } else {
            console.log(`[VOICE_SERVICE] MOCK CALL: Code for ${venueName} is ${code}`);
        }

        return { code };
    },

    /**
     * Verifies the code entered by the user.
     */
    async verifyPhoneCode(venueId: string, enteredCode: string): Promise<boolean> {
        const doc = await db.collection('phoneVerifications').doc(venueId).get();

        if (!doc.exists) return false;

        const data = doc.data();
        if (!data || data.status !== 'pending') return false;
        if (Date.now() > data.expiresAt) {
            await doc.ref.update({ status: 'expired' });
            return false;
        }

        if (data.code === enteredCode) {
            await doc.ref.update({ status: 'verified', verifiedAt: Date.now() });
            return true;
        }

        return false;
    }
};
