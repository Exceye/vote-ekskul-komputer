import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// Konfigurasi Firebase Asli Milikmu
const firebaseConfig = {
  apiKey: "AIzaSyBgo0vlEkinuM2HnEtoGMHa_ggPsjlSXdU",
  authDomain: "vote-ekskul-app.firebaseapp.com",
  projectId: "vote-ekskul-app",
  storageBucket: "vote-ekskul-app.firebasestorage.app",
  messagingSenderId: "346034754456",
  appId: "1:346034754456:web:0338b599d2541f825151ed"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
