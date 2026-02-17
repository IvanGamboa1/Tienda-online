/* ═══════════════════════════════════════════════
   SUPABASE — pon tus credenciales aquí
═══════════════════════════════════════════════ */
const SB_URL = "https://oasuoihjkoaaxajwjleo.supabase.co";
const SB_KEY = "sb_publishable_f_LGWDnVb0Gu7oM4NV2imA_iuNmon1I";
const sb = supabase.createClient(SB_URL, SB_KEY);

/* estado local del stock */
const SL = {};

/* ═══════════════════════════════════════════════
   ARRANQUE — todo se conecta aquí
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  /* --- botones login --- */
  document.getElementById('btnLogin').onclick = doLogin;
  document.getElementById('btnOjo').onclick   = toggleOjo;
  document.getElementById('inEmail').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
  document.getElementById('inPass').addEventListener('keydown',  e => { if(e.key==='Enter') doLogin(); });

  /* --- botones dashboard --- */
  document.getElementById('btnOut').onclick  = doLogout;
  document.getElementById('btnCfg').onclick  = guardarCfg;
  document.getElementById('btnPass').onclick = cambiarPass;

  /* --- productos --- */
  document.getElementById('fotoInput')?.addEventListener('change', previewFoto);
  document.getElementById('btnAgregar')?.addEventListener('click', agregarProducto);

  /* --- navegación --- */
  document.querySelectorAll('.nav-btn[data-v]').forEach(b => {
    b.onclick = () => irVista(b.dataset.v, b);
  });

  /* --- sesión activa --- */
  try {
    const { data:{ session } } = await sb.auth.getSession();
    if (session) abrirDash(session.user);
  } catch(e) { /* sin sesión */ }
});

/* ═══════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════ */
async function doLogin() {
  const email = document.getElementById('inEmail').value.trim();
  const pass  = document.getElementById('inPass').value;
  const btn   = document.getElementById('btnLogin');

  /* limpiar */
  document.getElementById('eEmail').textContent = '';
  document.getElementById('ePass').textContent  = '';
  document.getElementById('alerta').classList.remove('on');

  /* validar */
  let ok = true;
  if (!email) { document.getElementById('eEmail').textContent='Ingresa tu correo.'; ok=false; }
  else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ document.getElementById('eEmail').textContent='Correo inválido.'; ok=false; }
  if (!pass)  { document.getElementById('ePass').textContent='Ingresa tu contraseña.'; ok=false; }
  if (!ok) return;

  /* spinner */
  btn.classList.add('spin');
  btn.disabled = true;

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

  btn.classList.remove('spin');
  btn.disabled = false;

  if (error) {
    document.getElementById('alertaTxt').textContent = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    document.getElementById('alerta').classList.add('on');
    setTimeout(() => document.getElementById('alerta').classList.remove('on'), 4500);
    return;
  }

  abrirDash(data.user);
}

/* ═══════════════════════════════════════════════
   ABRIR DASHBOARD
═══════════════════════════════════════════════ */
function abrirDash(user) {
  /* ocultar login */
  const ls = document.getElementById('loginScreen');
  ls.classList.add('out');
  setTimeout(() => { ls.style.display='none'; }, 520);

  /* mostrar dash */
  document.getElementById('dash').classList.add('on');

  /* info del admin */
  const nom = user.email.split('@')[0];
  document.getElementById('chipN').textContent  = nom;
  document.getElementById('chipAv').textContent = nom[0].toUpperCase();

  /* cargar datos */
  cargarStock();
  cargarPedidos();
}

/* ═══════════════════════════════════════════════
   LOGOUT
═══════════════════════════════════════════════ */
async function doLogout() {
  await sb.auth.signOut();
  document.getElementById('dash').classList.remove('on');
  const ls = document.getElementById('loginScreen');
  ls.style.display = 'flex';
  ls.classList.remove('out');
  document.getElementById('inEmail').value = '';
  document.getElementById('inPass').value  = '';
}

/* ═══════════════════════════════════════════════
   NAVEGACIÓN
═══════════════════════════════════════════════ */
const VISTAS = {
  overview:  ['DASHBOARD',     'Resumen general · K1KO Streetwear 2026'],
  stock:     ['STOCK',         'Actualiza inventario · Cambios en tiempo real'],
  productos: ['PRODUCTOS',     'Agrega o elimina productos del catálogo'],
  pedidos:   ['PEDIDOS',       'Historial de compras por WhatsApp'],
  config:    ['CONFIGURACIÓN', 'Ajustes de tienda y cuenta admin'],
};

function irVista(key, btn) {
  document.querySelectorAll('.vista').forEach(v => v.classList.remove('on'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('on'));
  const v = document.getElementById('v-'+key);
  if (v)   v.classList.add('on');
  if (btn) btn.classList.add('on');
  const [t,s] = VISTAS[key] || [key.toUpperCase(),''];
  document.getElementById('vtit').textContent = t;
  document.getElementById('vsub').textContent = s;
  if (key === 'productos') cargarProductos();
}

/* ═══════════════════════════════════════════════
   STOCK
═══════════════════════════════════════════════ */
const MAXREF = 5;

async function cargarStock() {
  const { data, error } = await sb.from('products').select('id,name,stock');
  if (error) { console.error(error); return; }
  const clamped = data.map(p => ({ ...p, stock: Math.min(MAXREF, p.stock) }));
  clamped.forEach(p => { SL[p.id] = p.stock; });
  renderStock(clamped);
  statStock(clamped);

  sb.channel('admin-rt')
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'products'}, () => cargarStock())
    .subscribe();
}

function renderStock(prods) {
  const html = prods.map(p => cardStock(p)).join('');
  const g1 = document.getElementById('g-overview');
  const g2 = document.getElementById('g-stock');
  if (g1) g1.innerHTML = html;
  if (g2) g2.innerHTML = html;
}

function cardStock(p) {
  const pct  = Math.min(100,(p.stock/MAXREF)*100);
  const lo   = p.stock>0 && p.stock<=2;
  const ze   = p.stock<=0;
  const bc   = ze?'ze':lo?'lo':'';
  const nc   = ze?'ze':lo?'lo':'ok';
  return `
  <div class="sc">
    <div class="sc-img">
      <img src="img/${p.id}.jpeg" alt="${p.name}" onerror="this.parentElement.innerHTML='<span class=sc-ph>K1KO</span>'">
    </div>
    <div class="sc-d">
      <div class="sc-n">${p.name}</div>
      <div class="sc-id">ID: ${p.id}</div>
      <div class="brow">
        <div class="bar"><div class="bf ${bc}" style="width:${ze?100:pct}%"></div></div>
        <span class="sn ${nc}" id="sn-${p.id}">${p.stock} uds</span>
      </div>
      <div class="ctrl">
        <button class="qb" onclick="ajQ('${p.id}',-1)">−</button>
        <div class="qd" id="qd-${p.id}">${p.stock}</div>
        <button class="qb" onclick="ajQ('${p.id}',1)">+</button>
        <button class="qsave" onclick="saveStock('${p.id}')"><i class="bi bi-floppy-fill"></i> Guardar</button>
      </div>
    </div>
  </div>`;
}

function ajQ(pid, d) {
  const n = Math.min(MAXREF, Math.max(0,(SL[pid]??0)+d));
  SL[pid] = n;
  const e1 = document.getElementById('qd-'+pid);
  const e2 = document.getElementById('sn-'+pid);
  if (e1) e1.textContent = n;
  if (e2) e2.textContent = n+' uds';
}

async function saveStock(pid) {
  const { error } = await sb.from('products').update({stock:SL[pid]??0}).eq('id',pid);
  if (error) toast('Error al guardar','fail');
  else       toast('Stock de "'+pid+'" guardado ✓','ok');
}

function statStock(prods) {
  const t = prods ? prods.reduce((s,p)=>s+p.stock,0) : Object.values(SL).reduce((s,v)=>s+v,0);
  const el = document.getElementById('sv-stk');
  if (el) el.textContent = t;
}

/* ═══════════════════════════════════════════════
   PEDIDOS
═══════════════════════════════════════════════ */
async function cargarPedidos() {
  const { data, error } = await sb.from('orders').select('*').order('created_at',{ascending:false}).limit(50);
  const body = document.getElementById('tbody');

  if (error) {
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#444">Crea la tabla <code style="color:#fbbf24">orders</code> en Supabase para ver pedidos aquí.</td></tr>`;
    document.getElementById('sv-ped').textContent = '0';
    document.getElementById('sv-ven').textContent = '$0';
    return;
  }
  if (!data || data.length===0) {
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#444">Sin pedidos aún</td></tr>`;
    document.getElementById('sv-ped').textContent = '0';
    return;
  }

  body.innerHTML = data.map(o => {
    const st  = o.estado||'pendiente';
    const cl  = st==='entregado'?'tok':st==='cancelado'?'tca':'tpe';
    const ic  = st==='entregado'?'bi-check-circle-fill':st==='cancelado'?'bi-x-circle-fill':'bi-clock-fill';
    const fe  = o.created_at ? new Date(o.created_at).toLocaleDateString('es-CO') : '—';
    const to  = o.total ? '$'+Number(o.total).toLocaleString('es-CO') : '—';
    return `<tr>
      <td><span class="oid">#${o.id}</span></td>
      <td>${o.cliente||'—'}</td>
      <td>${o.producto||'—'}</td>
      <td style="color:var(--gold);font-weight:700">${to}</td>
      <td><span class="tag ${cl}"><i class="bi ${ic}"></i> ${st}</span></td>
      <td>${fe}</td>
    </tr>`;
  }).join('');

  document.getElementById('sv-ped').textContent = data.length;
  const total = data.reduce((s,o)=>s+(Number(o.total)||0),0);
  document.getElementById('sv-ven').textContent = '$'+total.toLocaleString('es-CO');
  document.getElementById('sv-ven-n').textContent = data.length+' pedido'+(data.length!==1?'s':'');
}

/* ═══════════════════════════════════════════════
   PRODUCTOS (nuevo)
═══════════════════════════════════════════════ */
const STORAGE_URL = `${SB_URL}/storage/v1/object/public/products/`;

async function cargarProductos() {
  const grid = document.getElementById('g-productos');
  grid.innerHTML = '<div class="ldmsg">Cargando productos...</div>';
  const { data, error } = await sb.from('products').select('*');
  if (error) { grid.innerHTML = '<div class="ldmsg">Error cargando productos</div>'; return; }
  if (!data || data.length === 0) { grid.innerHTML = '<div class="ldmsg">No hay productos aún</div>'; return; }
  grid.innerHTML = data.map(p => {
    const precio = p.price ? '$'+Number(p.price).toLocaleString('es-CO') : '—';
    return `
    <div class="pc" id="pc-${p.id}">
      <div class="pc-img">
        <img src="${p.image||''}" alt="${p.name}" onerror="this.parentElement.innerHTML='<span class=sc-ph>K1KO</span>'">
      </div>
      <div class="pc-info">
        <div class="pc-name">${p.name}</div>
        <div class="pc-meta">
          <span class="pc-price">${precio}</span>
          <span class="pc-stock">${p.stock} uds</span>
        </div>
        <div class="pc-id">ID: ${p.id}</div>
      </div>
      <button class="pc-del" onclick="eliminarProducto('${p.id}','${p.image||''}')">
        <i class="bi bi-trash3-fill"></i> Eliminar
      </button>
    </div>`;
  }).join('');
}

function previewFoto() {
  const file = document.getElementById('fotoInput').files[0];
  if (!file) return;
  document.getElementById('fotoPrev').src = URL.createObjectURL(file);
  document.getElementById('fotoWrap').classList.add('has-img');
}

async function agregarProducto() {
  const nombre = document.getElementById('pNombre').value.trim();
  const precio = document.getElementById('pPrecio').value.trim();
  const stock  = document.getElementById('pStock').value.trim();
  const file   = document.getElementById('fotoInput').files[0];
  const btn    = document.getElementById('btnAgregar');
  if (!nombre)               { toast('Ingresa el nombre','fail'); return; }
  if (!precio||isNaN(precio)){ toast('Ingresa un precio válido','fail'); return; }
  if (!stock||isNaN(stock))  { toast('Ingresa el stock inicial','fail'); return; }
  if (!file)                 { toast('Selecciona una foto','fail'); return; }
  const pid = nombre.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Subiendo...';
  const ext = file.name.split('.').pop();
  const fileName = `${pid}.${ext}`;
  const { error: uploadErr } = await sb.storage.from('products').upload(fileName, file, { upsert:true });
  if (uploadErr) {
    toast('Error subiendo imagen: '+uploadErr.message,'fail');
    btn.disabled=false; btn.innerHTML='<i class="bi bi-plus-circle-fill"></i> Agregar producto'; return;
  }
  const imageUrl = STORAGE_URL + fileName;
  const { error: dbErr } = await sb.from('products').insert({ id:pid, name:nombre, price:parseInt(precio), stock:parseInt(stock), image:imageUrl });
  btn.disabled=false; btn.innerHTML='<i class="bi bi-plus-circle-fill"></i> Agregar producto';
  if (dbErr) { toast('Error: '+dbErr.message,'fail'); return; }
  toast(`"${nombre}" agregado ✓`,'ok');
  document.getElementById('pNombre').value='';
  document.getElementById('pPrecio').value='';
  document.getElementById('pStock').value='';
  document.getElementById('fotoInput').value='';
  document.getElementById('fotoPrev').src='';
  document.getElementById('fotoWrap').classList.remove('has-img');
  cargarProductos();
  cargarStock();
}

async function eliminarProducto(pid, imageUrl) {
  if (!confirm(`¿Eliminar "${pid}"? No se puede deshacer.`)) return;
  if (imageUrl && imageUrl.includes('supabase')) {
    const fileName = imageUrl.split('/products/')[1];
    if (fileName) await sb.storage.from('products').remove([fileName]);
  }
  const { error } = await sb.from('products').delete().eq('id', pid);
  if (error) { toast('Error eliminando: '+error.message,'fail'); return; }
  toast(`"${pid}" eliminado ✓`,'ok');
  cargarProductos();
  cargarStock();
}

/* ═══════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════ */
function guardarCfg() { toast('Configuración guardada ✓','ok'); }

async function cambiarPass() {
  const p1 = document.getElementById('cP1').value;
  const p2 = document.getElementById('cP2').value;
  if (!p1||p1.length<8) { toast('Mínimo 8 caracteres','fail'); return; }
  if (p1!==p2)          { toast('Las contraseñas no coinciden','fail'); return; }
  const { error } = await sb.auth.updateUser({ password:p1 });
  if (error) toast('Error: '+error.message,'fail');
  else { toast('Contraseña actualizada ✓','ok'); document.getElementById('cP1').value=''; document.getElementById('cP2').value=''; }
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function toggleOjo() {
  const i = document.getElementById('inPass');
  const e = document.getElementById('iOjo');
  i.type = i.type==='password' ? 'text' : 'password';
  e.className = i.type==='password' ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill';
}

let _tt;
function toast(msg, tipo='ok') {
  const t = document.getElementById('toast');
  const i = document.getElementById('tIco');
  document.getElementById('tMsg').textContent = msg;
  t.className = 'toast '+tipo+' on';
  i.className = tipo==='ok' ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill';
  clearTimeout(_tt);
  _tt = setTimeout(() => t.classList.remove('on'), 3500);
}