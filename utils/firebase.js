const admin = require("firebase-admin");
const serviceAccount = require("../config/craftopia-c8c47-firebase-adminsdk-yanr7-1eefc24806.json");

const initializeFirebase = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
};

module.exports = { initializeFirebase, admin };
