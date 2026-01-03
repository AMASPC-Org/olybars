import { db } from './firebaseAdmin';

async function countVenues() {
    try {
        const snapshot = await db.collection('venues').get();
        console.log(`Total Venues in Firestore: ${snapshot.size}`);
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`- ${doc.id}: ${data.name} (Active: ${data.isActive}, Visible: ${data.isVisible})`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error counting venues:', error);
        process.exit(1);
    }
}

countVenues();
