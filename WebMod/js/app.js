/* =========================
   CONFIG (ajusta a tu HTML)
   ========================= */
const SELECTORS = {
  // Filtros / acciones
  q: '#q',                               // input búsqueda (por username / id / notas / estado / peligro)
  estado: '#f-estado',                   // select Estado (Todos / Revisión / Investigación / Banned / Activo)
  peligro: '#f-peligro',                 // select Peligro (Todos / Bajo / Medio / Extremo)
  btnNuevo: '#btn-nuevo',                // botón "Nuevo usuario VRChat" (abre formulario)
  // Tabla
  tbody: '#banTbody',                    // <tbody> de la tabla
  total: '#totalRows',                   // span con total filtrado (opcional)
  // Formulario (puede ser un modal o un card)
  form: '#banForm',
  f_username: '#r-username',
  f_vrid: '#r-vrchatId',
  f_estado: '#r-estado',
  f_peligro: '#r-peligro',
  f_evidencias: '#r-evidencias',
  f_notas: '#r-notas',
  f_creadoPor: '#r-creadoPor',           // se autocompleta con currentUser.nombre
  f_fechaCreacion: '#r-fechaCreacion',
  f_fechaActualizacion: '#r-fechaActualizacion',
  f_dias: '#r-diasSancion',
  f_submit: '#r-submit',
  f_cancel: '#r-cancel'
};

/* =========================
   KEYS Y SEEDS
   ========================= */
const LS_KEYS = {
  USERS: 'modapp_users',          // [{nombre, correo, contraseña, vrchatId, discord, grupos:[], nivel}]
  CURRENT: 'modapp_currentUser',  // {nombre, correo, nivel}
  BANNED: 'modapp_banned'         // array de reportes
};

// Seed mínimo de ejemplo (puedes quitarlo si ya tienes datos)
function seedIfEmpty() {
  if (!localStorage.getItem(LS_KEYS.USERS)) {
    const users = [
      { nombre: 'Gonzalo', correo: 'shadowcarmesi@gmail.com', contraseña: '123', vrchatId: 'usr_demo', discord: 'Gonza#0001', grupos: [], nivel: 'admin' },
      { nombre: 'ModeradorX', correo: 'modx@example.com', contraseña: '123', vrchatId: 'usr_modx', discord: 'ModX#0002', grupos: [], nivel: 'moderator' },
      { nombre: 'Viewer1', correo: 'viewer@example.com', contraseña: '123', vrchatId: 'usr_view', discord: 'View#0003', grupos: [], nivel: 'viewer' },
    ];
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
  }

  if (!localStorage.getItem(LS_KEYS.CURRENT)) {
    // Simula sesión iniciada con un moderador/admin. Cambia si ya tienes login real.
    const current = { nombre: 'Gonzalo', correo: 'shadowcarmesi@gmail.com', nivel: 'admin' };
    localStorage.setItem(LS_KEYS.CURRENT, JSON.stringify(current));
  }

  if (!localStorage.getItem(LS_KEYS.BANNED)) {
    const today = new Date().toISOString().slice(0, 10);
    const demo = [
      {
        id: crypto.randomUUID(),
        username: 'Dragodoro',
        vrchatId: 'https://vrchat.com/home/user/usr_626cac50-6fe6-4901-b4d0-36c8a9061c56',
        estado: 'Banned',
        peligro: 'Extremo',
        evidencias: 'https://vrchat.com/home/user/usr_626cac50-6fe6-4901-b4d0-36c8a9061c56',
        notas: 'Pedofilia, acoso, doxing',
        creadoPor: 'Gonzalo',                 // ← NOMBRE, no correo
        fechaCreacion: today,
        fechaActualizacion: today,
        diasSancion: 'Permanente'
      }
    ];
    localStorage.setItem(LS_KEYS.BANNED, JSON.stringify(demo));
  }
}
seedIfEmpty();

/* =========================
   HELPERS de storage
   ========================= */
const store = {
  getUsers: () => JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]'),
  getCurrent: () => JSON.parse(localStorage.getItem(LS_KEYS.CURRENT) || 'null'),
  setCurrent: (u) => localStorage.setItem(LS_KEYS.CURRENT, JSON.stringify(u)),
  getBanned: () => JSON.parse(localStorage.getItem(LS_KEYS.BANNED) || '[]'),
  setBanned: (arr) => localStorage.setItem(LS_KEYS.BANNED, JSON.stringify(arr)),
};

/* =========================
   ESTADO UI
   ========================= */
const UI = {
  q: document.querySelector(SELECTORS.q),
  filtroEstado: document.querySelector(SELECTORS.estado),
  filtroPeligro: document.querySelector(SELECTORS.peligro),
  btnNuevo: document.querySelector(SELECTORS.btnNuevo),
  tbody: document.querySelector(SELECTORS.tbody),
  total: document.querySelector(SELECTORS.total),

  form: document.querySelector(SELECTORS.form),
  f_username: document.querySelector(SELECTORS.f_username),
  f_vrid: document.querySelector(SELECTORS.f_vrid),
  f_estado: document.querySelector(SELECTORS.f_estado),
  f_peligro: document.querySelector(SELECTORS.f_peligro),
  f_evidencias: document.querySelector(SELECTORS.f_evidencias),
  f_notas: document.querySelector(SELECTORS.f_notas),
  f_creadoPor: document.querySelector(SELECTORS.f_creadoPor),
  f_fechaCreacion: document.querySelector(SELECTORS.f_fechaCreacion),
  f_fechaActualizacion: document.querySelector(SELECTORS.f_fechaActualizacion),
  f_dias: document.querySelector(SELECTORS.f_dias),
  f_submit: document.querySelector(SELECTORS.f_submit),
  f_cancel: document.querySelector(SELECTORS.f_cancel),

  editingId: null
};

/* =========================
   RENDER TABLA
   ========================= */
function renderTable() {
  const q = (UI.q?.value || '').trim().toLowerCase();
  const e = (UI.filtroEstado?.value || 'Todos').toLowerCase();
  const p = (UI.filtroPeligro?.value || 'Todos').toLowerCase();

  const datos = store.getBanned();
  let filtered = datos.filter(x => {
    const hayQ =
      !q ||
      (x.username && x.username.toLowerCase().includes(q)) ||
      (x.vrchatId && String(x.vrchatId).toLowerCase().includes(q)) ||
      (x.estado && x.estado.toLowerCase().includes(q)) ||
      (x.peligro && x.peligro.toLowerCase().includes(q)) ||
      (x.notas && x.notas.toLowerCase().includes(q)) ||
      (x.creadoPor && x.creadoPor.toLowerCase().includes(q));
    const hayE = (e === 'todos') || (x.estado && x.estado.toLowerCase() === e);
    const hayP = (p === 'todos') || (x.peligro && x.peligro.toLowerCase() === p);
    return hayQ && hayE && hayP;
  });

  if (UI.total) UI.total.textContent = filtered.length;

  if (!UI.tbody) return;

  UI.tbody.innerHTML = '';
  filtered.forEach((x) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td class="ellipsis">${x.diasSancion || ''}</td>
      <td class="ellipsis"><a href="${x.vrchatId || '#'}" target="_blank" rel="noreferrer">${x.vrchatId || ''}</a></td>
      <td>${escapeHtml(x.notas || '')}</td>
      <td>${escapeHtml(x.creadoPor || '')}</td>
      <td>${fmtDate(x.fechaActualizacion)}</td>
      <td>
        <button class="btn secondary sm" data-edit="${x.id}">Editar</button>
        <button class="btn danger sm" data-del="${x.id}">Eliminar</button>
      </td>
    `;
    UI.tbody.appendChild(tr);
  });
}

function escapeHtml(s){
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

function fmtDate(d){
  if (!d) return '';
  return d;
}

/* =========================
   CRUD
   ========================= */
function blankForm() {
  UI.editingId = null;
  UI.form?.reset?.();
  const today = new Date().toISOString().slice(0,10);
  if (UI.f_fechaCreacion) UI.f_fechaCreacion.value = today;
  if (UI.f_fechaActualizacion) UI.f_fechaActualizacion.value = today;

  const current = store.getCurrent();
  if (UI.f_creadoPor) UI.f_creadoPor.value = current?.nombre || '';
}

function loadToForm(item) {
  UI.editingId = item.id;
  if (UI.f_username) UI.f_username.value = item.username || '';
  if (UI.f_vrid) UI.f_vrid.value = item.vrchatId || '';
  if (UI.f_estado) UI.f_estado.value = item.estado || 'Revisión';
  if (UI.f_peligro) UI.f_peligro.value = item.peligro || 'Bajo';
  if (UI.f_evidencias) UI.f_evidencias.value = item.evidencias || '';
  if (UI.f_notas) UI.f_notas.value = item.notas || '';
  if (UI.f_creadoPor) UI.f_creadoPor.value = item.creadoPor || '';
  if (UI.f_fechaCreacion) UI.f_fechaCreacion.value = item.fechaCreacion || '';
  if (UI.f_fechaActualizacion) UI.f_fechaActualizacion.value = item.fechaActualizacion || '';
  if (UI.f_dias) UI.f_dias.value = item.diasSancion || '';
}

function collectForm() {
  const current = store.getCurrent();
  const now = new Date().toISOString().slice(0,10);

  return {
    id: UI.editingId || crypto.randomUUID(),
    username: UI.f_username?.value?.trim() || '',
    vrchatId: UI.f_vrid?.value?.trim() || '',
    estado: UI.f_estado?.value || 'Revisión',
    peligro: UI.f_peligro?.value || 'Bajo',
    evidencias: UI.f_evidencias?.value?.trim() || '',
    notas: UI.f_notas?.value?.trim() || '',
    // CLAVE: guardamos el NOMBRE del moderador, no el correo
    creadoPor: (UI.f_creadoPor?.value?.trim()) || current?.nombre || '',
    fechaCreacion: UI.f_fechaCreacion?.value || now,
    fechaActualizacion: now,
    diasSancion: UI.f_dias?.value?.trim() || ''
  };
}

function saveRecord(e) {
  e?.preventDefault?.();
  const data = collectForm();
  const list = store.getBanned();

  const idx = list.findIndex(x => x.id === data.id);
  if (idx === -1) {
    list.unshift(data);
  } else {
    list[idx] = data;
  }
  store.setBanned(list);
  blankForm();
  renderTable();
}

function editRecord(id) {
  const list = store.getBanned();
  const item = list.find(x => x.id === id);
  if (!item) return;
  loadToForm(item);
  scrollToForm();
}

function delRecord(id) {
  const list = store.getBanned().filter(x => x.id !== id);
  store.setBanned(list);
  renderTable();
}

function scrollToForm(){
  if (!UI.form) return;
  UI.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* =========================
   EVENTOS
   ========================= */
function wireEvents() {
  UI.q && UI.q.addEventListener('input', renderTable);
  UI.filtroEstado && UI.filtroEstado.addEventListener('change', renderTable);
  UI.filtroPeligro && UI.filtroPeligro.addEventListener('change', renderTable);

  UI.btnNuevo && UI.btnNuevo.addEventListener('click', () => {
    blankForm();
    scrollToForm();
  });

  UI.form && UI.form.addEventListener('submit', saveRecord);
  UI.f_cancel && UI.f_cancel.addEventListener('click', (e)=> {
    e.preventDefault();
    blankForm();
  });

  // Delegación para Editar / Eliminar
  UI.tbody && UI.tbody.addEventListener('click', (ev) => {
    const editId = ev.target?.getAttribute?.('data-edit');
    const delId  = ev.target?.getAttribute?.('data-del');
    if (editId) editRecord(editId);
    if (delId) {
      if (confirm('¿Eliminar este registro?')) delRecord(delId);
    }
  });
}

/* =========================
   INIT
   ========================= */
function init() {
  // Asegura que “Creado por” se precargue con el nombre del usuario logueado
  const current = store.getCurrent();
  if (UI.f_creadoPor && current?.nombre) UI.f_creadoPor.value = current.nombre;

  wireEvents();
  renderTable();
}
document.addEventListener('DOMContentLoaded', init);
