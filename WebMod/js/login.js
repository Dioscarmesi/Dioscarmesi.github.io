import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD252QV0ZYnrLD6vuWRbztX5Vz2rP2BcNY",
  authDomain: "moderacionvrchat.firebaseapp.com",
  projectId: "moderacionvrchat",
  storageBucket: "moderacionvrchat.firebasestorage.app",
  messagingSenderId: "672740338111",
  appId: "1:672740338111:web:09c4a934e858db4ee1990a",
  measurementId: "G-9NYG6M2TDB"
};

// Inicializa Firebase
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Referencias del DOM
const emailInput = document.getElementById('email');
const passInput  = document.getElementById('password');
const btnLogin   = document.getElementById('btnLogin');
const btnGoogle  = document.getElementById('btnGoogle');

btnLogin.addEventListener('click', async () => {
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passInput.value);
    // Redirige al panel de moderación al iniciar sesión
    window.location.href = 'moderation.html';
  } catch (err) {
    alert(`Error al iniciar sesión: ${err.message}`);
  }
});

btnGoogle.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    window.location.href = 'moderation.html';
  } catch (err) {
    alert(`Error con Google: ${err.message}`);
  }
});

// Si ya está autenticado, redirigir al panel
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'moderation.html';
  }
});