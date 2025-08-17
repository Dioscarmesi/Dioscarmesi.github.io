import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import {
  getAuth,
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

// Referencias de elementos
const userBox    = document.getElementById('userBox');
const userEmail  = document.getElementById('userEmail');
const userRole   = document.getElementById('userRole');
const btnLogout  = document.getElementById('btnLogout');

const searchInput   = document.getElementById('search');
const filterStatus  = document.getElementById('filterStatus');
const btnRefresh    = document.getElementById('btnRefresh');
const btnOpenCreate = document.getElementById('btnOpenCreate');
const rowsBody      = document.getElementById('rows');

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

// Cierra sesión
btnLogout.addEventListener('click', () => signOut(auth));

// Observador de autenticación
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (!user) {
    // Si no hay usuario, redirige al login
    window.location.href = 'login.html';
    return;
  }
  // Obtiene el rol
  try {
    const roleSnap = await getDoc(doc(db, 'roles', user.uid));
    currentRole = roleSnap.exists() ? roleSnap.data().role : 'viewer';
  } catch {
    currentRole = 'viewer';
  }
  userEmail.textContent = user.email;
  userRole.textContent  = currentRole;
  userBox.classList.remove('hidden');
  // Muestra u oculta el botón de crear según rol
  btnOpenCreate.style.display = (currentRole === 'admin' || currentRole === 'moderator') ? 'inline-block' : 'none';
  loadUsers();
});

// Cargar usuarios
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

// Delegación para editar y eliminar
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

// Abrir modal de creación
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

// Guardar usuario
btnSave.addEventListener('click', async () => {
  const userData = {
    username:     f_username.value.trim(),
    userId:       f_userId.value.trim(),
    status:       f_status.value,
    danger:       f_danger.value,
    sanctionDays: f_sanctionDays.value.trim(),
    evidences:    f_evidences.value.trim(),
    notes:        f_notes.value.trim(),
    createdByName: currentUser ? (currentUser.email || '') : '',
    updatedAt:    serverTimestamp()
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