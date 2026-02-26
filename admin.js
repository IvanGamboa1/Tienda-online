/* ═══════════════════════════════════════════════
   SUPABASE
═══════════════════════════════════════════════ */
const SB_URL = "https://oasuoihjkoaaxajwjleo.supabase.co";
const SB_KEY = "sb_publishable_f_LGWDnVb0Gu7oM4NV2imA_iuNmon1I";
const sb = supabase.createClient(SB_URL, SB_KEY);

const SL = {};
let pedidosData = [];
let pedidoSeleccionado = null;

/* ═══════════════════════════════════════════════
   ARRANQUE
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('btnLogin').onclick = doLogin;
  document.getElementById('btnOjo').onclick   = toggleOjo;
  document.getElementById('inEmail').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
  document.getElementById('inPass').addEventListener('keydown',  e => { if(e.key==='Enter') doLogin(); });

  document.getElementById('btnOut').onclick  = doLogout;
  document.getElementById('btnCfg').onclick  = guardarCfg;
  document.getElementById('btnPass').onclick = cambiarPass;

  document.getElementById('fotoInput')?.addEventListener('change', previewFoto);
  document.getElementById('btnAgregar')?.addEventListener('click', agregarProducto);

  document.querySelectorAll('.nav-btn[data-v]').forEach(b => {
    b.onclick = () => irVista(b.dataset.v, b);
  });

  // Modal pedido — cerrar
  document.getElementById('modalOverlay').addEventListener('click', function(e){
    if(e.target === this) cerrarModalPedido();
  });
  document.getElementById('btnCerrarModal').addEventListener('click', cerrarModalPedido);

  // Filtros pedidos
  document.querySelectorAll('.filtro-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      filtrarPedidos(b.dataset.estado);
    });
  });

  // Buscar pedidos
  document.getElementById('buscarPedido').addEventListener('input', e => {
    buscarEnPedidos(e.target.value);
  });

  try {
    const { data:{ session } } = await sb.auth.getSession();
    if (session) abrirDash(session.user);
  } catch(e) {}
});

/* ═══════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════ */
async function doLogin() {
  const email = document.getElementById('inEmail').value.trim();
  const pass  = document.getElementById('inPass').value;
  const btn   = document.getElementById('btnLogin');

  document.getElementById('eEmail').textContent = '';
  document.getElementById('ePass').textContent  = '';
  document.getElementById('alerta').classList.remove('on');

  let ok = true;
  if (!email) { document.getElementById('eEmail').textContent='Ingresa tu correo.'; ok=false; }
  else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ document.getElementById('eEmail').textContent='Correo inválido.'; ok=false; }
  if (!pass)  { document.getElementById('ePass').textContent='Ingresa tu contraseña.'; ok=false; }
  if (!ok) return;

  btn.classList.add('spin');
  btn.disabled = true;

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

  btn.classList.remove('spin');
  btn.disabled = false;

  if (error) {
    document.getElementById('alertaTxt').textContent = 'Credenciales incorrectas.';
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
  const ls = document.getElementById('loginScreen');
  ls.classList.add('out');
  setTimeout(() => { ls.style.display='none'; }, 520);

  document.getElementById('dash').classList.add('on');

  const nom = user.email.split('@')[0];
  document.getElementById('chipN').textContent  = nom;
  document.getElementById('chipAv').textContent = nom[0].toUpperCase();

  cargarStock();
  cargarPedidos();

  // Realtime: nuevos pedidos
  sb.channel('new-orders')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
      notificarNuevoPedido(payload.new);
      cargarPedidos();
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
      cargarPedidos();
    })
    .subscribe();
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
  pedidos:   ['PEDIDOS',       'Gestión y confirmación de pedidos'],
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
  if (key === 'pedidos')   cargarPedidos();
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
   PEDIDOS — CARGA PRINCIPAL
═══════════════════════════════════════════════ */
async function cargarPedidos() {
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = `<tr><td colspan="7" class="td-loading"><div class="ld-spin"></div>Cargando pedidos...</td></tr>`;

  const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false }).limit(100);

  if (error) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#444">Error cargando pedidos: ${error.message}</td></tr>`;
    return;
  }

  pedidosData = data || [];
  actualizarStatsOverview(pedidosData);
  renderizarPedidos(pedidosData);
}

function actualizarStatsOverview(data) {
  const total    = data.reduce((s,o) => s+(Number(o.total)||0), 0);
  const pedidos  = data.length;
  const pendientes = data.filter(o => o.estado === 'pendiente').length;

  const elVen  = document.getElementById('sv-ven');
  const elPed  = document.getElementById('sv-ped');
  const elVenN = document.getElementById('sv-ven-n');
  if (elVen)  elVen.textContent  = '$'+total.toLocaleString('es-CO');
  if (elPed)  elPed.textContent  = pedidos;
  if (elVenN) elVenN.textContent = pendientes + ' pendiente'+(pendientes!==1?'s':'');

  // Badge en sidebar
  const badge = document.getElementById('badge-pedidos');
  if (badge) {
    badge.textContent = pendientes > 0 ? pendientes : '';
    badge.style.display = pendientes > 0 ? 'flex' : 'none';
  }
}

function renderizarPedidos(lista) {
  const tbody = document.getElementById('tbody');

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="td-empty"><i class="bi bi-inbox"></i><br>Sin pedidos aún</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(o => {
    const st  = o.estado || 'pendiente';
    const cls = { pendiente:'tpe', confirmado:'tok', enviado:'tenv', cancelado:'tca' }[st] || 'tpe';
    const ico = { pendiente:'bi-clock-fill', confirmado:'bi-check-circle-fill', enviado:'bi-truck', cancelado:'bi-x-circle-fill' }[st] || 'bi-clock-fill';
    const lbl = { pendiente:'Pendiente', confirmado:'Confirmado', enviado:'Enviado', cancelado:'Cancelado' }[st] || st;
    const fe  = o.created_at ? new Date(o.created_at).toLocaleDateString('es-CO', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
    const to  = o.total ? '$'+Number(o.total).toLocaleString('es-CO') : '—';
    const esPendiente = st === 'pendiente';
    return `
    <tr class="tr-pedido ${esPendiente ? 'tr-pendiente' : ''}" onclick="abrirModalPedido('${o.id}')">
      <td><span class="oid">${o.order_id || '#'+o.id}</span>${esPendiente ? '<span class="dot-nuevo"></span>' : ''}</td>
      <td><div class="cliente-cell"><span class="cli-nom">${o.cliente || '—'}</span><span class="cli-tel">${o.celular || ''}</span></div></td>
      <td><div class="prod-cell">${(o.productos_resumen || '—').split('\n').map(l => `<span>${l}</span>`).join('')}</div></td>
      <td style="color:var(--gold);font-weight:800;font-family:'JetBrains Mono',monospace">${to}</td>
      <td>${o.metodo_pago || '—'}</td>
      <td><span class="tag ${cls}"><i class="bi ${ico}"></i> ${lbl}</span></td>
      <td>${fe}</td>
    </tr>`;
  }).join('');
}

/* ═══════════════════════════════════════════════
   FILTROS Y BÚSQUEDA
═══════════════════════════════════════════════ */
function filtrarPedidos(estado) {
  if (!estado || estado === 'todos') {
    renderizarPedidos(pedidosData);
  } else {
    renderizarPedidos(pedidosData.filter(p => p.estado === estado));
  }
}

function buscarEnPedidos(termino) {
  if (!termino) { renderizarPedidos(pedidosData); return; }
  const t = termino.toLowerCase();
  renderizarPedidos(pedidosData.filter(p =>
    (p.cliente||'').toLowerCase().includes(t) ||
    (p.order_id||'').toLowerCase().includes(t) ||
    (p.celular||'').includes(t) ||
    (p.barrio||'').toLowerCase().includes(t)
  ));
}

/* ═══════════════════════════════════════════════
   MODAL DETALLE PEDIDO
═══════════════════════════════════════════════ */
function abrirModalPedido(id) {
  const pedido = pedidosData.find(p => String(p.id) === String(id));
  if (!pedido) return;
  pedidoSeleccionado = pedido;

  // Header
  document.getElementById('m-order-id').textContent  = pedido.order_id || '#'+pedido.id;
  document.getElementById('m-fecha').textContent     = pedido.created_at ? new Date(pedido.created_at).toLocaleString('es-CO') : '—';

  // Estado badge
  const st  = pedido.estado || 'pendiente';
  const cls = { pendiente:'tpe', confirmado:'tok', enviado:'tenv', cancelado:'tca' }[st] || 'tpe';
  const ico = { pendiente:'bi-clock-fill', confirmado:'bi-check-circle-fill', enviado:'bi-truck', cancelado:'bi-x-circle-fill' }[st] || 'bi-clock-fill';
  const lbl = { pendiente:'Pendiente', confirmado:'Confirmado', enviado:'Enviado', cancelado:'Cancelado' }[st] || st;
  document.getElementById('m-estado').innerHTML = `<span class="tag ${cls}"><i class="bi ${ico}"></i> ${lbl}</span>`;

  // Cliente
  document.getElementById('m-cliente').textContent   = pedido.cliente || '—';
  document.getElementById('m-celular').textContent   = pedido.celular || '—';
  document.getElementById('m-email').textContent     = pedido.email || '—';
  document.getElementById('m-doc').textContent       = `${pedido.tipo_doc || ''} ${pedido.num_doc || ''}`;
  document.getElementById('m-factura').textContent   = pedido.tipo_factura || '—';

  // Envío
  document.getElementById('m-ciudad').textContent    = pedido.ciudad || '—';
  document.getElementById('m-barrio').textContent    = pedido.barrio || '—';
  document.getElementById('m-direccion').textContent = pedido.direccion || '—';
  document.getElementById('m-adicional').textContent = pedido.direccion_adicional || 'No especificado';
  document.getElementById('m-recibe').textContent    = pedido.recibe || '—';
  // Costo de envío
  const envCosto = pedido.costo_envio !== undefined && pedido.costo_envio !== null
    ? (Number(pedido.costo_envio) === 0 ? 'GRATIS' : '$' + Number(pedido.costo_envio).toLocaleString('es-CO') + ' COP')
    : '—';
  document.getElementById('m-costo-envio').textContent = envCosto;
  document.getElementById('m-costo-envio').style.color = Number(pedido.costo_envio) === 0 ? '#25D366' : '#fbbf24';
  // Subtotal y total desglosado
  document.getElementById('m-subtotal').textContent = pedido.subtotal ? '$' + Number(pedido.subtotal).toLocaleString('es-CO') + ' COP' : '—';

  // Pago
  document.getElementById('m-metodo').textContent    = pedido.metodo_pago || '—';
  document.getElementById('m-ref').textContent       = pedido.referencia_pago || 'Sin referencia';

  // Productos
  let prods = [];
  try { prods = JSON.parse(pedido.productos_json || '[]'); } catch(e) {}
  const prodHTML = prods.map(p => `
    <div class="m-prod-item">
      <div class="m-prod-img"><img src="img/${p.id}.jpeg" onerror="this.src=''" alt="${p.name}"><span class="m-prod-qty">x${p.qty}</span></div>
      <div class="m-prod-info">
        <div class="m-prod-name">${p.name}</div>
        <div class="m-prod-det">Talla: <strong>${p.size}</strong> · $${Number(p.price).toLocaleString('es-CO')} c/u</div>
      </div>
      <div class="m-prod-sub">$${(p.price * p.qty).toLocaleString('es-CO')}</div>
    </div>`).join('');
  document.getElementById('m-productos').innerHTML = prodHTML || '<p style="color:#666">Sin detalle</p>';

  // Total
  document.getElementById('m-total').textContent = '$'+(Number(pedido.total)||0).toLocaleString('es-CO')+' COP';

  // Botones de acción según estado
  renderBotonesAccion(st);

  document.getElementById('modalOverlay').classList.add('on');
  document.body.style.overflow = 'hidden';
}

function renderBotonesAccion(estado) {
  const zona = document.getElementById('m-acciones');
  zona.innerHTML = '';

  const cel = pedidoSeleccionado?.celular || '';

  if (estado === 'pendiente') {
    zona.innerHTML = `
      <button class="m-btn m-btn-confirm" onclick="cambiarEstadoPedido('confirmado')">
        <i class="bi bi-check-circle-fill"></i> Confirmar Pedido
      </button>
      <button class="m-btn m-btn-wa" onclick="enviarMensajeWA('confirmacion')">
        <i class="bi bi-whatsapp"></i> Confirmar y notificar
      </button>
      <button class="m-btn m-btn-cancel" onclick="cambiarEstadoPedido('cancelado')">
        <i class="bi bi-x-circle"></i> Cancelar Pedido
      </button>`;
  } else if (estado === 'confirmado') {
    zona.innerHTML = `
      <button class="m-btn m-btn-envio" onclick="cambiarEstadoPedido('enviado')">
        <i class="bi bi-truck"></i> Marcar como Enviado
      </button>
      <button class="m-btn m-btn-wa" onclick="enviarMensajeWA('envio')">
        <i class="bi bi-whatsapp"></i> Notificar envío al cliente
      </button>
      <button class="m-btn m-btn-cancel" onclick="cambiarEstadoPedido('cancelado')">
        <i class="bi bi-x-circle"></i> Cancelar
      </button>`;
  } else if (estado === 'enviado') {
    zona.innerHTML = `
      <button class="m-btn m-btn-wa" onclick="enviarMensajeWA('entregado')">
        <i class="bi bi-whatsapp"></i> Notificar entrega
      </button>
      <button class="m-btn m-btn-confirm" onclick="cambiarEstadoPedido('confirmado')">
        <i class="bi bi-arrow-counterclockwise"></i> Volver a Confirmado
      </button>`;
  } else if (estado === 'cancelado') {
    zona.innerHTML = `
      <button class="m-btn m-btn-wa" onclick="enviarMensajeWA('cancelado')">
        <i class="bi bi-whatsapp"></i> Notificar cancelación
      </button>
      <button class="m-btn m-btn-confirm" onclick="cambiarEstadoPedido('pendiente')">
        <i class="bi bi-arrow-counterclockwise"></i> Reactivar pedido
      </button>`;
  }
}

function cerrarModalPedido() {
  document.getElementById('modalOverlay').classList.remove('on');
  document.body.style.overflow = 'auto';
  pedidoSeleccionado = null;
}

/* ═══════════════════════════════════════════════
   CAMBIAR ESTADO PEDIDO
═══════════════════════════════════════════════ */
async function cambiarEstadoPedido(nuevoEstado) {
  if (!pedidoSeleccionado) return;

  const { error } = await sb.from('orders')
    .update({ estado: nuevoEstado })
    .eq('id', pedidoSeleccionado.id);

  if (error) {
    toast('Error actualizando estado: '+error.message, 'fail');
    return;
  }

  pedidoSeleccionado.estado = nuevoEstado;
  const lbl = { pendiente:'Pendiente', confirmado:'Confirmado ✓', enviado:'Enviado 🚚', cancelado:'Cancelado' }[nuevoEstado];
  toast(`Pedido marcado como: ${lbl}`, 'ok');

  // Actualizar UI del modal
  const cls = { pendiente:'tpe', confirmado:'tok', enviado:'tenv', cancelado:'tca' }[nuevoEstado] || 'tpe';
  const ico = { pendiente:'bi-clock-fill', confirmado:'bi-check-circle-fill', enviado:'bi-truck', cancelado:'bi-x-circle-fill' }[nuevoEstado] || 'bi-clock-fill';
  document.getElementById('m-estado').innerHTML = `<span class="tag ${cls}"><i class="bi ${ico}"></i> ${lbl}</span>`;
  renderBotonesAccion(nuevoEstado);

  // Recargar lista
  await cargarPedidos();
}

/* ═══════════════════════════════════════════════
   ENVIAR MENSAJE WHATSAPP AL CLIENTE
═══════════════════════════════════════════════ */
function enviarMensajeWA(tipo) {
  if (!pedidoSeleccionado) return;
  const p = pedidoSeleccionado;
  const cel = (p.celular || '').replace(/\D/g, '');
  if (!cel) { toast('El cliente no tiene celular registrado', 'fail'); return; }

  const num    = cel.startsWith('57') ? cel : '57' + cel;
  const nombre = (p.cliente || 'cliente').split(' ')[0];
  const orderId = p.order_id || '#' + p.id;
  const total   = '$' + (Number(p.total) || 0).toLocaleString('es-CO') + ' COP';

  let prods = [];
  try { prods = JSON.parse(p.productos_json || '[]'); } catch(e) {}
  const listaProd = prods.map(x => `• ${x.name} · Talla ${x.size} · x${x.qty}`).join('\n');

  let msg = '';
  let nuevoEstado = null;

  if (tipo === 'confirmacion') {
    nuevoEstado = 'confirmado';
    msg  = `¡Hola ${nombre}! 👋\n\n`;
    msg += `✅ *Tu pedido ha sido CONFIRMADO* 🎉\n\n`;
    msg += `*K1KO Streetwear*\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📦 *Pedido:* ${orderId}\n`;
    msg += `💰 *Total:* ${total}\n\n`;
    msg += `*Productos:*\n${listaProd}\n\n`;
    msg += `📍 *Dirección:*\n${p.barrio} — ${p.direccion}\n`;
    msg += `👤 Recibe: ${p.recibe}\n\n`;
    msg += `🚚 Tu pedido llegará en *24 horas hábiles*.\n\n`;
    msg += `*K1KO Streetwear* 🖤`;

  } else if (tipo === 'envio') {
    nuevoEstado = 'enviado';
    msg  = `¡Hola ${nombre}! 🚚\n\n`;
    msg += `*Tu pedido está en camino* ✈️\n\n`;
    msg += `*K1KO Streetwear*\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📦 *Pedido:* ${orderId}\n\n`;
    msg += `*Productos:*\n${listaProd}\n\n`;
    msg += `📍 *Dirección:* ${p.barrio} — ${p.direccion}\n`;
    msg += `👤 Recibe: ${p.recibe}\n\n`;
    msg += `📱 Te contactaremos cuando lleguemos.\n*K1KO Streetwear* 🖤`;

  } else if (tipo === 'entregado') {
    msg  = `¡Hola ${nombre}! 🎉\n\n`;
    msg += `*Tu pedido fue ENTREGADO exitosamente* ✅\n\n`;
    msg += `Gracias por tu compra. ¡Esperamos que ames tu ropa! 🔥\n`;
    msg += `Síguenos en Instagram *@k1ko45* para ver nuevos drops!\n\n`;
    msg += `*K1KO Streetwear* 🖤`;

  } else if (tipo === 'cancelado') {
    msg  = `Hola ${nombre},\n\n`;
    msg += `Lamentamos informarte que tu pedido *${orderId}* ha sido cancelado.\n\n`;
    msg += `Si tienes dudas escríbenos con gusto te ayudamos.\n\n`;
    msg += `*K1KO Streetwear* 🖤`;
  }

  // 1. Abrir WhatsApp INMEDIATAMENTE (sin esperar Supabase)
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  toast(`Mensaje enviado a ${nombre} ✓`, 'ok');

  // 2. Actualizar estado en Supabase EN SEGUNDO PLANO (no bloquea)
  if (nuevoEstado) {
    cambiarEstadoPedido(nuevoEstado);
  }
}

/* ═══════════════════════════════════════════════
   NOTIFICACIÓN NUEVO PEDIDO (realtime)
═══════════════════════════════════════════════ */
function notificarNuevoPedido(pedido) {
  // Sonido
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch(e) {}

  // Toast especial
  const t = document.getElementById('toast');
  document.getElementById('tMsg').textContent = `🛍️ Nuevo pedido de ${pedido.cliente || 'cliente'} · $${Number(pedido.total||0).toLocaleString('es-CO')} COP`;
  t.className = 'toast nuevo on';
  document.getElementById('tIco').className = 'bi bi-bag-check-fill';
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('on'), 6000);
}

/* ═══════════════════════════════════════════════
   PRODUCTOS
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