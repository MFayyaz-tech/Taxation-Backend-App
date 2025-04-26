const admin = require("firebase-admin");
const path = require("path");
// Initialize Firebase Admin SDK
const serviceAccount = require(path.join(
  __dirname,
  "../../config/taxation-bot-firebase-adminsdk-fbsvc-f592dc3edb.json"
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function sendPushNotification(token, title, body, data = {}) {
  const message = {
    token,
    notification: { title, body },
    data, // Custom data payload
    android: {
      priority: "high",
      notification: {
        sound: "default",
        click_action: "OPEN_ACTIVITY", // Adjust as needed
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          category: "NEW_MESSAGE",
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Push notification sent:", response);
    return { success: true, response };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error };
  }
}

module.exports = sendPushNotification;
