const admin = require('firebase-admin');

// Initialize Firebase Admin
// This relies on you having run 'gcloud auth application-default login'
// or having GOOGLE_APPLICATION_CREDENTIALS set.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch (e) {
    console.error('Initialization Error:', e);
    process.exit(1);
  }
}

const db = admin.firestore();

async function inspectVenue() {
  console.log('?? Inspecting venues collection...');
  try {
    const snapshot = await db.collection('venues').limit(1).get();
    
    if (snapshot.empty) {
      console.log('? No documents found in venues collection.');
      return;
    }

    snapshot.forEach(doc => {
      console.log('------------------------------------------------');
      console.log('?? Venue ID: ' + doc.id);
      console.dir(doc.data(), { depth: null, colors: true });
      console.log('------------------------------------------------');
    });
  } catch (error) {
    console.error('? Error querying Firestore:', error);
  }
}

inspectVenue();
