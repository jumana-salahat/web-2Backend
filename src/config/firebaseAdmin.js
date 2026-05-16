import admin from "firebase-admin";

//
//Initializes Firebase Admin SDK (SW Development Kit) on the BE using environment file.
//Used to verify Google ID tokens sent from the FE by BE.
//

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ?.replace(/^"|"$/g, "")
  .replace(/\\n/g, "\n");



admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});


export default admin;