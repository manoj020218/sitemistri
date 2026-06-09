const { admin }           = require('../config/firebase');
const NotificationToken   = require('../models/NotificationToken.model');
const { FCM_EVENTS }      = require('../utils/constants');

const sendToUser = async (userId, eventKey, data = {}) => {
  try {
    const event  = FCM_EVENTS[eventKey];
    if (!event)  return;
    const tokens = await NotificationToken.find({ userId }).select('fcmToken');
    if (!tokens.length) return;

    const messages = tokens.map(t => ({
      notification: { title: event.title, body: event.body },
      data:         { ...data, type: eventKey, siteWorkId: data.siteWorkId || '' },
      token:        t.fcmToken,
    }));

    const results = await admin.messaging().sendEach(messages);
    // Remove invalid tokens
    results.responses.forEach(async (r, i) => {
      if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
        await NotificationToken.deleteOne({ fcmToken: tokens[i].fcmToken });
      }
    });
  } catch (e) {
    console.error('FCM error:', e.message);
  }
};

module.exports = { sendToUser };
