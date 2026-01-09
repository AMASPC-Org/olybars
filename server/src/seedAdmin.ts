import { auth, db } from './firebaseAdmin';

async function seedAdmin() {
    const adminEmail = 'ryan@amaspc.com';
    const partnerEmail = 'ryan@americanmarketingalliance.com';
    const adminPassword = 'Password123';
    const adminHandle = 'RyanAdmin';
    const partnerHandle = 'RyanPartner';

    const setupUser = async (email: string, password: string, handle: string, profileUpdates: any) => {
        console.log(`Setting up User: ${email}...`);
        try {
            let userRecord;
            try {
                userRecord = await auth.getUserByEmail(email);
                console.log(`${email} already exists in Auth.`);
            } catch (e) {
                userRecord = await auth.createUser({
                    email,
                    password,
                    displayName: handle,
                });
                console.log(`Created new user ${email} in Auth.`);
            }

            const uid = userRecord.uid;
            await db.collection('users').doc(uid).set({
                uid,
                email,
                handle,
                ...profileUpdates,
                updatedAt: Date.now()
            }, { merge: true });

            console.log(`✅ User ${email} (UID: ${uid}) configured.`);
            return uid;
        } catch (error) {
            console.error(`❌ Failed to setup user ${email}:`, error);
        }
    };

    // 1. Setup Super Admin
    await setupUser(adminEmail, adminPassword, adminHandle, {
        role: 'super-admin',
        systemRole: 'admin',
        stats: {
            seasonPoints: 0,
            lifetimeClockins: 100,
            currentStreak: 42
        }
    });

    // 2. Setup Venue Partner
    await setupUser(partnerEmail, adminPassword, partnerHandle, {
        role: 'owner',
        systemRole: 'guest',
        venuePermissions: {
            'well80': 'owner',
            'hannahs': 'owner' // Adding a couple for variety
        },
        stats: {
            seasonPoints: 50,
            lifetimeClockins: 5,
            currentStreak: 1
        }
    });
}

seedAdmin();
