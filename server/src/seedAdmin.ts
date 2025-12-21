import { auth, db } from './firebaseAdmin';

async function seedAdmin() {
    const adminEmail = 'ryan@amaspc.com';
    const adminPassword = 'Password123';
    const adminHandle = 'RyanAdmin';

    console.log(`Setting up Global Admin: ${adminEmail}...`);

    try {
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(adminEmail);
            console.log('Admin user already exists in Auth.');
        } catch (e) {
            userRecord = await auth.createUser({
                email: adminEmail,
                password: adminPassword,
                displayName: adminHandle,
            });
            console.log('Created new Admin user in Auth.');
        }

        const uid = userRecord.uid;

        await db.collection('users').doc(uid).set({
            uid,
            email: adminEmail,
            handle: adminHandle,
            role: 'admin',
            stats: {
                seasonPoints: 9999,
                lifetimeCheckins: 100,
                currentStreak: 42
            }
        }, { merge: true });

        console.log(`✅ Global Admin ${adminEmail} (UID: ${uid}) is now established with 'admin' role.`);
    } catch (error) {
        console.error('❌ Failed to seed admin:', error);
    }
}

seedAdmin();
