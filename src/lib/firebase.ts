import { initializeApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** Realtime Database is used only when a project config is supplied via env vars. */
export const firebaseEnabled = Boolean(config.apiKey && config.databaseURL)

let rtdb: Database | null = null

if (firebaseEnabled) {
  rtdb = getDatabase(initializeApp(config))
}

export { rtdb }
