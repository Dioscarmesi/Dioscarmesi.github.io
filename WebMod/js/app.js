import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

// Configuración de Firebase (sustituye por la tuya si fuese necesario)
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
const db   = getFirestore(app);

// Referencias de la interfaz
const authCard   = document.getElementById('authCard');
const appCard    = document.getElementById('app');
const userBox    = document.getElementById('userBox');
const userEmail  = document.getElementById('userEmail');
const userRole   = document.getElementById('userRole');
const btnLogout  = document.getElementById('btnLogout');

// Campos de registro e inicio de sesión
const nameInput         = document.getElementById('name');
const emailInput        = document.getElementById('email');
const passInput         = document.getElementById('password');
const confirmPassInput  = document.getElementById('confirmPassword');
const vrchatIdReg       = document.getElementById('vrchatIdReg');
const discordInput      = document.getElementById('discord');
const btnLogin          = document.getElementById('btnLogin');
const btnSignup         = document.getElementById('btnSignup');
const btnGoogle         = document.getElementById('btnGoogle');

// Controles de la tabla y búsqueda
const searchInput   = document.getElementById('search');
const filterStatus  = document.getElementById('filterStatus');
const btnRefresh    = document.getElementById('btnRefresh');
const btnOpenCreate = document.getElementById('btnOpenCreate');
const rowsBody      = document.getElementById('rows');

// Elementos del modal
const modal           = document.getElementById('modal');
const modalTitle      = document.getElementById('modalTitle');
const f_username      = document.getElementById('f_username');
const f_userId        = document.getElementById('f_userId');
const f_status        = document.getElementById('f_status');
const f_danger        = document.getElementById('f_danger');
const f_sanctionDays  = document.getElementById('f_sanctionDays');
const f_evidences     = document.getElementById('f_evidences');
const f_notes         = document.getElementById('f_notes');
const btnSave         = document.getElementById('btnSave');
const btnCancel       = document.getElementById('btnCancel');

let currentUser = null;
let currentRole = null;
let editingId   = null;

// === Manejo de autenticación ===
btnLogin.addEventListener('click', async () => {
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passInput.value);
  } catch (err) {
    alert(`Error al iniciar sesión: ${err.message}`);
  }
});

btnSignup.addEventListener('click', async () => {
  if (passInput.value !== confirmPassInput.value) {
    alert('Las contraseñas no coinciden');
    return;
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, emailInput.value, passInput.value);
    const uid  = cred.user.uid;
    // Guarda la cuenta con rol viewer y datos adicionales
    await setDoc(doc(db, 'accounts', uid), {
      name:     nameInput.value.trim(),
      email:    emailInput.value.trim(),
      vrchatId: vrchatIdReg.value.trim(),
      discord:  discordInput.value.trim(),
      groups:   [],
      role:     'viewer'
    });
    // Crea/actualiza documento de roles con rol viewer
    await setDoc(doc(db, 'roles', uid), { role: 'viewer' });
    alert('Cuenta creada; ahora puedes iniciar sesión.');
  } catch (err) {
    alert(`Error al crear la cuenta: ${err.message}`);
  }
});

btnGoogle.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert(`Error con Google: ${err.message}`);
  }
});

btnLogout.addEventListener('click', () => signOut(auth));

// Observador de cambios de sesión
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    try {
      const roleSnap = await getDoc(doc(db, 'roles', user.uid));
      currentRole = roleSnap.exists() ? roleSnap.data().role : 'viewer';
    } catch {
      currentRole = 'viewer';
    }
    userEmail.textContent = user.email;
    userRole.textContent  = currentRole;
    userBox.classList.remove('hidden');
    authCard.classList.add('hidden');
    appCard.classList.remove('hidden');
    // Solo admin/moderator pueden crear registros
    btnOpenCreate.style.display = (currentRole === 'admin' || currentRole === 'moderator') ? 'inline-block' : 'none';
    loadUsers();
  } else {
    currentRole = null;
    userBox.classList.add('hidden');
    authCard.classList.remove('hidden');
    appCard.classList.add('hidden');
    rowsBody.innerHTML = '';
  }
});

// === CRUD de usuarios de VRChat (banned users) ===
async function loadUsers() {
  rowsBody.innerHTML = '';
  const q = query(collection(db, 'users'), orderBy('username', 'asc'));
  const snap = await getDocs(q);
  snap.forEach((docSnap) => {
    const data   = docSnap.data();
    const term   = searchInput.value.toLowerCase();
    const status = filterStatus.value;
    const matchSearch = data.username.toLowerCase().includes(term) || data.userId.toLowerCase().includes(term);
    const matchStatus = status === '' || data.status === status;
    if (matchSearch && matchStatus) {
      addRow(docSnap.id, data);
    }
  });
}

btnRefresh.addEventListener('click', loadUsers);
searchInput.addEventListener('input', loadUsers);
filterStatus.addEventListener('change', loadUsers);

function addRow(id, data) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${data.username}</td>
    <td>${data.userId}</td>
    <td>${data.status}</td>
    <td>${data.danger || ''}</td>
    <td>${data.sanctionDays || ''}</td>
    <td>${data.evidences || ''}</td>
    <td>${data.notes || ''}</td>
    <td>${data.createdByName || ''}</td>
    <td>${data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toLocaleDateString() : ''}</td>
    <td>
      ${(currentRole === 'admin' || currentRole === 'moderator') ? `
        <button class="edit" data-id="${id}">Editar</button>
        <button class="delete" data-id="${id}">Eliminar</button>` : ''}
    </td>
  `;
  rowsBody.appendChild(tr);
}

// Delegación de eventos para editar o eliminar
rowsBody.addEventListener('click', async (ev) => {
  const target = ev.target;
  if (target.classList.contains('edit')) {
    editingId = target.dataset.id;
    const snap = await getDoc(doc(db, 'users', editingId));
    const user = snap.data();
    modalTitle.textContent = 'Editar usuario';
    f_username.value     = user.username;
    f_userId.value       = user.userId;
    f_status.value       = user.status;
    f_danger.value       = user.danger || 'bajo';
    f_sanctionDays.value = user.sanctionDays || '';
    f_evidences.value    = user.evidences || '';
    f_notes.value        = user.notes || '';
    modal.classList.remove('hidden');
  } else if (target.classList.contains('delete')) {
    const idToDelete = target.dataset.id;
    if (confirm('¿Eliminar este usuario?')) {
      await deleteDoc(doc(db, 'users', idToDelete));
      loadUsers();
    }
  }
});

// Botón para abrir el modal de creación
btnOpenCreate.addEventListener('click', () => {
  editingId = null;
  modalTitle.textContent = 'Nuevo usuario VRChat';
  f_username.value     = '';
  f_userId.value       = '';
  f_status.value       = 'revision';
  f_danger.value       = 'bajo';
  f_sanctionDays.value = '';
  f_evidences.value    = '';
  f_notes.value        = '';
  modal.classList.remove('hidden');
});

// Guardar o actualizar usuario
btnSave.addEventListener('click', async () => {
  const userData = {
    username:    f_username.value.trim(),
    userId:      f_userId.value.trim(),
    status:      f_status.value,
    danger:      f_danger.value,
    sanctionDays: f_sanctionDays.value.trim(),
    evidences:   f_evidences.value.trim(),
    notes:       f_notes.value.trim(),
    createdByName: currentUser ? (currentUser.email || '') : '',
    updatedAt:   serverTimestamp()
  };
  if (editingId) {
    await updateDoc(doc(db, 'users', editingId), userData);
  } else {
    userData.createdAt = serverTimestamp();
    userData.createdBy = currentUser ? currentUser.uid : '';
    await addDoc(collection(db, 'users'), userData);
  }
  modal.classList.add('hidden');
  loadUsers();
});

btnCancel.addEventListener('click', () => {
  modal.classList.add('hidden');
});