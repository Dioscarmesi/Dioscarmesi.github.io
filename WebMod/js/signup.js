import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

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

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// Referencias del DOM
const nameInput        = document.getElementById('name');
const emailInput       = document.getElementById('email');
const passInput        = document.getElementById('password');
const confirmPassInput = document.getElementById('confirmPassword');
const vrchatIdReg      = document.getElementById('vrchatIdReg');
const discordInput     = document.getElementById('discord');
const btnSignup        = document.getElementById('btnSignup');

btnSignup.addEventListener('click', async () => {
  if (passInput.value !== confirmPassInput.value) {
    alert('Las contraseñas no coinciden');
    return;
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, emailInput.value, passInput.value);
    const uid  = cred.user.uid;
    // Crea documento de cuenta con rol viewer
    await setDoc(doc(db, 'accounts', uid), {
      name:     nameInput.value.trim(),
      email:    emailInput.value.trim(),
      vrchatId: vrchatIdReg.value.trim(),
      discord:  discordInput.value.trim(),
      groups:   [],
      role:     'viewer'
    });
    // Documento de roles para permisos
    await setDoc(doc(db, 'roles', uid), { role: 'viewer' });
    alert('Cuenta creada con éxito. Ahora puedes iniciar sesión.');
    window.location.href = 'login.html';
  } catch (err) {
    alert(`Error al crear la cuenta: ${err.message}`);
  }
});

// Redirigir si ya está autenticado
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'moderation.html';
  }
});