import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, deleteDoc, doc, getDoc, limit } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

// Tu firebaseConfig aquí
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxx"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- UI refs ---
const authCard = document.getElementById('authCard');
const appCard = document.getElementById('app');
const modal = document.getElementBy
