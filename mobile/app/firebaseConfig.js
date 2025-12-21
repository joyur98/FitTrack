import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCNJ0sFwWA_7gbbbKuBtWJhX8BlGApVp7I",
  authDomain: "fittrack-3cb4c.firebaseapp.com",
  projectId: "fittrack-3cb4c",
  storageBucket: "fittrack-3cb4c.firebasestorage.app",
  messagingSenderId: "421615150296",
  appId: "1:421615150296:web:c4a15e108996ee62c5a3ad"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
