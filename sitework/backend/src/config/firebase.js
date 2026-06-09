const admin = require('firebase-admin');

const initFirebase = () => {
  if (admin.apps.length) return;
  if (!process.env.FCM_PROJECT_ID || process.env.FCM_PROJECT_ID.startsWith('your_')) {
    console.warn('⚠️  Firebase not configured — push notifications disabled');
    return;
  }
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FCM_PROJECT_ID,
        clientEmail: process.env.FCM_CLIENT_EMAIL,
        privateKey:  process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialised');
  } catch (e) {
    console.warn('⚠️  Firebase init failed — push notifications disabled:', e.message);
  }
};

module.exports = { admin, initFirebase };
