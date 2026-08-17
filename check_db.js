import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const docSnap = await getDoc(doc(db, 'clubData', 'master'));
  if (docSnap.exists()) {
    console.log("DB EXISTS. Keys:", Object.keys(docSnap.data()));
    console.log("Content keys:", Object.keys(docSnap.data().content || {}));
  } else {
    console.log("DB IS EMPTY");
  }
  process.exit(0);
}
check();
