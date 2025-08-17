import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, deleteDoc, doc, getDoc, limit } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

// Tu firebaseConfig aquí
const firebaseConfig = {
apiKey: "AIzaSyD252QV0ZYnrLD6vuWRbztX5Vz2rP2BcNY",
authDomain: "moderacionvrchat.firebaseapp.com",
projectId: "moderacionvrchat",
storageBucket: "moderacionvrchat.firebasestorage.app",
messagingSenderId: "672740338111",
appId: "1:672740338111:web:09c4a934e858db4ee1990a",
measurementId: "G-9NYG6M2TDB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- UI refs ---
const authCard = document.getElementById('authCard');
const appCard = document.getElementById('app');
const modal = document.getElementBy
