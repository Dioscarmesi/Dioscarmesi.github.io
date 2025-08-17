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
  where,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

// Configuración de Firebase (ya la tienes correcta)
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
const db   = getFirestore(app);

// === Referencias de la UI ===
const authCard   = document.getElementById('authCard');
const appCard    = document.getElementById('appCard');
const loginEmail = document.getElementById('loginEmail');
const loginPass  = document.getElementById('loginPassword');
const loginBtn   = document.getElementById('loginBtn');
const registerBtn= document.getElementById('registerBtn');
const googleBtn  = document.getElementById('googleBtn');
const logoutBtn  = document.getElementById('logoutBtn');

const searchInput= document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const usersTableBody = document.getElementById('usersTableBody');
const createUserBtn = document.getElementById('createUserBtn');

// Modal para crear/editar usuarios
const userModal    = document.getElementById('userModal');
const modalTitle   = document.getElementById('modalTitle');
const saveUserBtn  = document.getElementById('saveUserBtn');
const usernameInput= document.getElementById('username');
const userIdInput  = document.getElementById('userId');
const statusInput  = document.getElementById('status');
const evidencesInput = document.getElementById('evidences');
const notesInput   = document.getElementById('notes');

let currentUser = null;
let currentRole = null;
let editingId   = null;

// === Funciones de autenticación ===
loginBtn.addEventListener('click', async (ev) => {
  ev.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPass.value);
  } catch (err) {
    alert(`Error al iniciar sesión: ${err.message}`);
  }
});

registerBtn.addEventListener('click', async (ev) => {
  ev.preventDefault();
  try {
    await createUserWithEmailAndPassword(auth, loginEmail.value, loginPass.value);
  } catch (err) {
    alert(`Error al registrarse: ${err.message}`);
  }
});

googleBtn.addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert(`Error con Google: ${err.message}`);
  }
});

logoutBtn.addEventListener('click', () => signOut(auth));

// Observa cambios en la sesión
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    // Obtén rol (collection roles/{uid}: {role: 'admin'|'moderator'|'viewer'})
    try {
      const roleSnap = await getDoc(doc(db, 'roles', user.uid));
      currentRole = roleSnap.exists() ? roleSnap.data().role : 'viewer';
    } catch {
      currentRole = 'viewer';
    }
    // Muestra panel de moderación
    authCard.style.display = 'none';
    appCard.style.display  = 'block';
    // Habilita botón de crear según rol
    createUserBtn.style.display = (currentRole === 'admin' || currentRole === 'moderator') ? 'block' : 'none';
    loadUsers();
  } else {
    currentRole = null;
    // Muestra formulario de login
    appCard.style.display  = 'none';
    authCard.style.display = 'block';
    usersTableBody.innerHTML = '';
  }
});

// === CRUD de usuarios de VRChat ===
async function loadUsers() {
  usersTableBody.innerHTML = '';
  // Lee todos los docs de la colección 'users'
  const q = query(collection(db, 'users'), orderBy('username', 'asc'));
  const snapshot = await getDocs(q);
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    // Filtros de búsqueda
    const term   = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    const matchName = data.username.toLowerCase().includes(term) ||
                      data.userId.toLowerCase().includes(term);
    const matchStatus = status === '' || data.status === status;
    if (matchName && matchStatus) {
      addRow(docSnap.id, data);
    }
  });
}

function addRow(id, data) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${data.username}</td>
    <td>${data.userId}</td>
    <td>${data.status}</td>
    <td>${data.evidences || ''}</td>
    <td>${data.notes || ''}</td>
    <td>${new Date(data.createdAt.seconds*1000).toLocaleDateString()}</td>
    <td>
      ${currentRole === 'admin' || currentRole === 'moderator' ? `
        <button class="edit" data-id="${id}">Editar</button>
        <button class="delete" data-id="${id}">Eliminar</button>` : ''}
    </td>`;
  usersTableBody.appendChild(tr);
}

searchInput.addEventListener('input', loadUsers);
statusFilter.addEventListener('change', loadUsers);

// Manejadores de los botones de la tabla (delegación)
usersTableBody.addEventListener('click', async (ev) => {
  const target = ev.target;
  if (target.classList.contains('edit')) {
    editingId = target.dataset.id;
    const snap = await getDoc(doc(db, 'users', editingId));
    const u = snap.data();
    modalTitle.textContent = 'Editar usuario';
    usernameInput.value  = u.username;
    userIdInput.value    = u.userId;
    statusInput.value    = u.status;
    evidencesInput.value = u.evidences || '';
    notesInput.value     = u.notes || '';
    userModal.showModal();
  }
  if (target.classList.contains('delete')) {
    const id = target.dataset.id;
    if (confirm('¿Eliminar usuario?')) {
      await deleteDoc(doc(db, 'users', id));
      loadUsers();
    }
  }
});

// Crear nuevo usuario
createUserBtn.addEventListener('click', () => {
  editingId = null;
  modalTitle.textContent = 'Crear usuario';
  usernameInput.value  = '';
  userIdInput.value    = '';
  statusInput.value    = 'active';
  evidencesInput.value = '';
  notesInput.value     = '';
  userModal.showModal();
});

// Guardar (crear o actualizar)
saveUserBtn.addEventListener('click', async () => {
  const data = {
    username:  usernameInput.value.trim(),
    userId:    userIdInput.value.trim(),
    status:    statusInput.value,
    evidences: evidencesInput.value.trim(),
    notes:     notesInput.value.trim(),
    updatedAt: serverTimestamp()
  };
  if (editingId) {
    await updateDoc(doc(db, 'users', editingId), data);
  } else {
    data.createdAt = serverTimestamp();
    data.createdBy = currentUser ? currentUser.uid : '';
    await addDoc(collection(db, 'users'), data);
  }
  userModal.close();
  loadUsers();
});
