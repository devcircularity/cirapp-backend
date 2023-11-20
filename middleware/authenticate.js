const admin = require('../firebaseAdmin'); // Update the path to the actual location of firebaseAdmin.js

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split('Bearer ')[1];
  try {
    // Use the Firebase Admin SDK to verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Here you set the decoded token which contains user info
    next();
  } catch (error) {
    console.error("Error verifying auth token", error);
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
