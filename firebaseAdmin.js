// firebaseAdmin.js

const admin = require('firebase-admin');
const serviceAccount = require('./jutdo-7b90f-firebase-adminsdk-kmksq-0d97f632ad.json'); // Path to your Firebase service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
