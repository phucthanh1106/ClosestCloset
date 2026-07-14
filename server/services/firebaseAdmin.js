import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase
const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
              credential: applicationDefault(),
              storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          });

// Initialize Cloud Storage and get a reference to the service
export const bucket = getStorage(app).bucket();