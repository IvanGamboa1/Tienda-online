/* ═══════════════════════════════════════════════════════════════
   K1KO · ESCÁNER / CAJA
   Lector de código de barras, cobro en mostrador, confirmación de
   pedidos online, etiquetas e impresión de recibos térmicos.
   Depende de: admin.js (sb, toast), JsBarcode, supabase/pos-setup.sql
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── utilidades ─────────────────────────────────────────── */
  const $  = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + (Number(n) || 0).toLocaleString('es-CO');
  const normCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  };
  const say = (m) => (typeof toast === 'function' ? toast(m, 'ok') : null);
  const fail = (m) => (typeof toast === 'function' ? toast(m, 'fail') : null);
  const fecha = (iso) => {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  const errMsg = (e) => String((e && e.message) || e || 'Error desconocido');

  /* ── estado ─────────────────────────────────────────────── */
  const S = {
    ready: false,
    tab: 'cobrar',
    cart: [],            // unidades escaneadas para cobrar
    metodo: 'Efectivo',
    orders: [],          // pedidos online pendientes/confirmados
    order: null,         // pedido seleccionado
    orderScans: [],      // unidades escaneadas para ese pedido
    products: [],
    lastLabels: [],      // última tanda creada
    recent: [],          // etiquetas recientes mostradas
    sales: [],
    busy: false
  };

  /* ── sonidos de confirmación ────────────────────────────── */
  let actx = null;
  function beep(ok) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = ok ? 1100 : 220;
      g.gain.value = 0.08;
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + (ok ? 0.09 : 0.28));
    } catch (e) { /* sin audio */ }
  }

  function msg(text, kind) {
    const el = $('posMsg');
    el.className = 'pos-msg ' + (kind || 'info');
    el.textContent = text;
    const box = $('posScanBox');
    if (kind === 'ok' || kind === 'err') {
      box.classList.remove('flash-ok', 'flash-err');
      void box.offsetWidth;
      box.classList.add(kind === 'ok' ? 'flash-ok' : 'flash-err');
      beep(kind === 'ok');
    }
  }
  function focusScan() { const i = $('posCode'); if (i && $('v-pos').classList.contains('on')) i.focus(); }

  /* ═══════════════════════════════════════════════════════════
     ARRANQUE / VERIFICAR INSTALACIÓN
  ═══════════════════════════════════════════════════════════ */
  const SETUP_HTML = (why) => `
    <h3><i class="bi bi-exclamation-triangle"></i> Falta un paso de instalación</h3>
    <p>${esc(why)}</p>
    <ol>
      <li>Abre Supabase → <b>SQL Editor</b> y ejecuta una sola vez el archivo <code>supabase/pos-setup.sql</code>.</li>
      <li>Registra tu correo como administrador ejecutando:
<pre>insert into public.admins (user_id)
select id from auth.users where email = 'TU_CORREO@ejemplo.com'
on conflict do nothing;</pre></li>
      <li>Recarga esta página.</li>
    </ol>`;

  async function checkSetup() {
    const { error } = await sb.rpc('income_summary', { p_desde: new Date(0).toISOString(), p_hasta: new Date().toISOString() });
    if (!error) return true;
    const m = String(error.message || '');
    const why = /permis|admin/i.test(m)
      ? 'Tu usuario todavía no está registrado como administrador del escáner.'
      : 'Las funciones del escáner aún no están instaladas en Supabase.';
    $('posSetup').innerHTML = SETUP_HTML(why);
    $('posSetup').hidden = false;
    $('posApp').hidden = true;
    return false;
  }

  async function init() {
    if (S.ready) { focusScan(); refreshTab(); return; }
    bindOnce();
    const paper = store.get('k1ko_paper', '80');
    $('posPaper').value = paper === '58' ? '58' : '80';
    S.ready = true;
    if (!(await checkSetup())) { S.ready = false; return; }
    $('posSetup').hidden = true; $('posApp').hidden = false;
    renderCart(); renderQuick();
    await loadProducts();
    refreshTab();
    focusScan();
  }

  let bound = false;
  function bindOnce() {
    if (bound) return; bound = true;

    $('posCode').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const v = e.target.value; e.target.value = '';
        if (v.trim()) onScan(v);
      }
    });
    // Si el lector escribe sin foco en el campo, lo redirigimos.
    document.addEventListener('keydown', (e) => {
      if (!$('v-pos').classList.contains('on') || S.tab === 'etiquetas' || S.tab === 'ventas') return;
      const t = document.activeElement && document.activeElement.tagName;
      if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(t || '') || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1) focusScan();
    });

    document.querySelectorAll('[data-pos-tab]').forEach((b) =>
      b.addEventListener('click', () => setTab(b.dataset.posTab)));

    $('posMethods').addEventListener('click', (e) => {
      const c = e.target.closest('.pos-chip'); if (!c) return;
      S.metodo = c.dataset.m;
      document.querySelectorAll('#posMethods .pos-chip').forEach((x) => x.classList.toggle('on', x === c));
      renderCart();
    });
    $('posRecibido').addEventListener('input', renderChange);
    $('posQuick').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $('posRecibido').value = b.dataset.v; renderChange();
    });
    $('posCobrar').addEventListener('click', cobrar);
    $('posVaciar').addEventListener('click', () => { S.cart = []; renderCart(); msg('Lista vacía.', 'info'); focusScan(); });
    $('posItems').addEventListener('click', (e) => {
      const x = e.target.closest('[data-rm]'); if (!x) return;
      S.cart = S.cart.filter((u) => u.code !== x.dataset.rm); renderCart(); focusScan();
    });

    $('posOrderSel').addEventListener('change', () => selectOrder($('posOrderSel').value));
    $('posOrderOk').addEventListener('click', confirmOrder);
    $('posOrderClear').addEventListener('click', () => { S.orderScans = []; renderOrder(); focusScan(); });
    $('posOrderItems').addEventListener('click', (e) => {
      const x = e.target.closest('[data-rm]'); if (!x) return;
      S.orderScans = S.orderScans.filter((u) => u.code !== x.dataset.rm); renderOrder(); focusScan();
    });

    $('posPaper').addEventListener('change', () => store.set('k1ko_paper', $('posPaper').value));

    $('posCamBtn').addEventListener('click', startCamera);
    $('posCamStop').addEventListener('click', stopCamera);

    $('labGen').addEventListener('click', genLabels);
    $('labReprint').addEventListener('click', () => printLabels(S.lastLabels));
    $('labOnlyStock').addEventListener('change', loadRecent);
    $('labPrintAll').addEventListener('click', () => printLabels(S.recent.map(toLabel)));
    $('labDeleteUnused').addEventListener('click', deleteUnusedLabels);
    $('labRecent').addEventListener('click', (e) => {
      const b = e.target.closest('[data-reprint]'); if (!b) return;
      const u = S.recent.find((r) => r.code === b.dataset.reprint);
      if (u) printLabels([toLabel(u)]);
    });
    $('posVentas').addEventListener('click', (e) => {
      const p = e.target.closest('[data-print-sale]');
      const v = e.target.closest('[data-void]');
      if (p) { const s = S.sales.find((x) => x.id === p.dataset.printSale); if (s) printSaleReceipt(s); }
      if (v) voidSale(v.dataset.void);
    });
  }

  function setTab(t) {
    if (t !== S.tab) stopCamera();
    S.tab = t;
    document.querySelectorAll('[data-pos-tab]').forEach((b) => b.classList.toggle('on', b.dataset.posTab === t));
    document.querySelectorAll('[data-pos-panel]').forEach((p) => { p.hidden = p.dataset.posPanel !== t; });
    $('posScanWrap').hidden = (t === 'etiquetas' || t === 'ventas');
    if (t === 'cobrar' || t === 'pedido') dockCamera(t);
    $('posNotice').hidden = true;
    refreshTab();
    focusScan();
  }
  function refreshTab() {
    if (S.tab === 'pedido') loadOrders();
    if (S.tab === 'etiquetas') loadRecent();
    if (S.tab === 'ventas') loadSales();
  }

  /* ═══════════════════════════════════════════════════════════
     ESCANEO
  ═══════════════════════════════════════════════════════════ */
  async function lookup(code) {
    const { data, error } = await sb.rpc('lookup_unit', { p_code: code });
    if (error) throw error;
    return data;
  }

  async function onScan(raw) {
    const code = normCode(raw);
    if (!code) return;
    if (S.busy) return;
    S.busy = true;
    try {
      msg('Buscando ' + code + '…', 'info');
      const u = await lookup(code);
      if (!u || !u.found) { msg('El código ' + code + ' no existe.', 'err'); return; }
      if (u.status !== 'en_stock') {
        msg(`${u.name} (${u.size}) · ${code} ya fue vendida${u.sold_at ? ' el ' + fecha(u.sold_at) : ''}.`, 'err');
        return;
      }
      if (S.tab === 'pedido') addOrderScan(u); else addToCart(u);
    } catch (e) {
      msg(errMsg(e), 'err');
    } finally { S.busy = false; focusScan(); }
  }

  function addToCart(u) {
    if (S.cart.some((c) => c.code === u.code)) { msg(u.code + ' ya estaba en la lista.', 'err'); return; }
    S.cart.push(u);
    renderCart();
    msg(`${u.name} · talla ${u.size} · ${money(u.price)}`, 'ok');
    // ¿Esta prenda corresponde a un pedido online pendiente?
    const n = $('posNotice');
    const pend = Array.isArray(u.pending_orders) ? u.pending_orders : [];
    if (pend.length) {
      n.innerHTML = `<i class="bi bi-info-circle"></i><span class="nt">Esta prenda coincide con ${pend.length === 1 ? 'un pedido online pendiente' : pend.length + ' pedidos online pendientes'}: ` +
        pend.map((o) => `<a href="#" data-goto-order="${esc(o.id)}">${esc(o.order_id)} · ${esc(o.cliente)}</a>`).join(' · ') +
        '. Si la entregas a ese cliente, confírmala en la pestaña “Confirmar pedido” para no cobrarla dos veces.</span>';
      n.hidden = false;
      n.querySelectorAll('[data-goto-order]').forEach((a) => a.addEventListener('click', (ev) => {
        ev.preventDefault();
        S.cart = S.cart.filter((c) => c.code !== u.code); renderCart();
        S.orderScans = [u];
        S._pendingOrderId = a.dataset.gotoOrder;
        setTab('pedido');
      }));
    } else n.hidden = true;
  }

  /* ═══════════════════════════════════════════════════════════
     COBRAR (mostrador)
  ═══════════════════════════════════════════════════════════ */
  const cartTotal = () => S.cart.reduce((a, u) => a + Number(u.price || 0), 0);

  function itemRow(u) {
    const img = u.image || `img/${u.product_id}.jpeg`;
    return `<div class="pos-item">
      <img src="${esc(img)}" alt="" onerror="this.style.visibility='hidden'">
      <div class="pos-item-info"><b>${esc(u.name)}</b><span>Talla ${esc(u.size)} · <code>${esc(u.code)}</code></span></div>
      <div class="pos-item-price">${money(u.price)}</div>
      <button class="pos-x" type="button" data-rm="${esc(u.code)}" aria-label="Quitar ${esc(u.code)}"><i class="bi bi-x-lg"></i></button>
    </div>`;
  }
  const EMPTY = '<div class="pos-empty"><i class="bi bi-upc-scan"></i>Escanea una camiseta para empezar</div>';

  function renderCart() {
    $('posItems').innerHTML = S.cart.length ? S.cart.map(itemRow).join('') : EMPTY;
    $('posCount').textContent = S.cart.length ? S.cart.length + ' prenda' + (S.cart.length > 1 ? 's' : '') : '';
    $('posTotal').textContent = money(cartTotal());
    $('posCash').hidden = S.metodo !== 'Efectivo';
    $('posCobrar').disabled = !S.cart.length;
    $('posVaciar').disabled = !S.cart.length;
    renderQuick(); renderChange();
  }

  function renderQuick() {
    const t = cartTotal();
    const opts = new Set();
    if (t > 0) {
      opts.add(t);
      [10000, 20000, 50000, 100000].forEach((d) => { const v = Math.ceil(t / d) * d; if (v >= t) opts.add(v); });
    }
    $('posQuick').innerHTML = [...opts].slice(0, 5)
      .map((v) => `<button type="button" class="pos-btn ghost sm" data-v="${v}">${v === t ? 'Exacto' : money(v)}</button>`).join('');
  }

  function renderChange() {
    const t = cartTotal(), r = Number($('posRecibido').value);
    const el = $('posCambio');
    if (!$('posRecibido').value || !t) { el.textContent = '—'; el.className = ''; return; }
    if (r < t) { el.textContent = 'Faltan ' + money(t - r); el.className = 'neg'; }
    else { el.textContent = money(r - t); el.className = 'pos'; }
  }

  async function cobrar() {
    if (!S.cart.length || S.busy) return;
    const t = cartTotal();
    let recibido = null;
    if (S.metodo === 'Efectivo' && $('posRecibido').value) {
      recibido = Math.round(Number($('posRecibido').value));
      if (!(recibido >= t)) { fail('El efectivo recibido no alcanza.'); return; }
    }
    S.busy = true; $('posCobrar').disabled = true;
    try {
      const { data, error } = await sb.rpc('sell_units', {
        p_codes: S.cart.map((u) => u.code),
        p_metodo: S.metodo,
        p_recibido: recibido,
        p_cliente: $('posCliente').value.trim() || null
      });
      if (error) throw error;
      S.cart = []; $('posRecibido').value = ''; $('posCliente').value = '';
      renderCart();
      const L = $('posLast');
      L.hidden = false;
      L.innerHTML = `<b><i class="bi bi-check-circle-fill"></i> Venta ${esc(data.sale_number)} registrada</b> · ${money(data.total)} · ${esc(data.metodo_pago)}` +
        (data.cambio != null ? ` · cambio ${money(data.cambio)}` : '') +
        ` <button class="pos-btn ghost sm" type="button" id="posReprint"><i class="bi bi-printer"></i> Recibo</button>`;
      $('posReprint').onclick = () => printSaleReceipt(data);
      msg('Venta registrada: ' + data.sale_number, 'ok');
      say('Venta ' + data.sale_number + ' · ' + money(data.total));
      if ($('posAutoPrint').checked) printSaleReceipt(data);
      refreshIncome(); if (typeof cargarStock === 'function') cargarStock();
    } catch (e) {
      msg(errMsg(e), 'err'); fail(errMsg(e));
      $('posCobrar').disabled = !S.cart.length;
    } finally { S.busy = false; focusScan(); }
  }

  /* ═══════════════════════════════════════════════════════════
     CONFIRMAR PEDIDO ONLINE
  ═══════════════════════════════════════════════════════════ */
  function parseItems(o) {
    try { const a = JSON.parse(o.productos_json || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }

  async function loadOrders() {
    const { data, error } = await sb.from('orders').select('*')
      .in('estado', ['pendiente', 'confirmado']).order('created_at', { ascending: false }).limit(100);
    if (error) { msg(errMsg(error), 'err'); return; }
    S.orders = data || [];
    const sel = $('posOrderSel');
    sel.innerHTML = S.orders.length
      ? S.orders.map((o) => `<option value="${esc(o.id)}">${esc(o.order_id)} · ${esc(o.cliente)} · ${esc(o.estado)}</option>`).join('')
      : '<option value="">No hay pedidos por confirmar</option>';
    const want = S._pendingOrderId || (S.order && S.order.id);
    if (S._pendingOrderId) S.order = null;   // viene del aviso: conserva la prenda ya escaneada
    S._pendingOrderId = null;
    if (want && S.orders.some((o) => String(o.id) === String(want))) sel.value = want;
    selectOrder(sel.value);
  }

  function selectOrder(id) {
    const prev = S.order ? String(S.order.id) : null;
    S.order = S.orders.find((o) => String(o.id) === String(id)) || null;
    // al cambiar de un pedido a otro, los escaneos anteriores no aplican
    if (prev !== null && String(id) !== prev) S.orderScans = [];
    renderOrder();
  }

  function reqRows() {
    const o = S.order; if (!o) return [];
    const map = new Map();
    parseItems(o).forEach((p) => {
      const k = p.id + '|' + String(p.size).toUpperCase();
      const r = map.get(k) || { id: p.id, name: p.name, size: String(p.size).toUpperCase(), req: 0, got: 0 };
      r.req += Number(p.qty) || 0; map.set(k, r);
    });
    S.orderScans.forEach((u) => {
      const k = u.product_id + '|' + String(u.size).toUpperCase();
      const r = map.get(k) || { id: u.product_id, name: u.name, size: String(u.size).toUpperCase(), req: 0, got: 0 };
      r.got += 1; map.set(k, r);
    });
    return [...map.values()];
  }

  function renderOrder() {
    const o = S.order;
    const info = $('posOrderInfo'), req = $('posReq');
    if (!o) {
      info.innerHTML = ''; req.innerHTML = '<div class="pos-empty"><i class="bi bi-inbox"></i>Sin pedidos pendientes</div>';
      $('posOrderItems').innerHTML = EMPTY; $('posOrderOk').disabled = true; $('posOrderClear').disabled = true;
      $('posOrderCount').textContent = ''; return;
    }
    info.innerHTML = `<b>${esc(o.cliente)}</b> · ${esc(o.ciudad || '')} · ${esc(o.celular || '')}<br>` +
      `Total ${money(o.total)} · ${esc(o.metodo_pago || '')} · estado <b>${esc(o.estado)}</b>` +
      ` <button class="pos-btn ghost sm" type="button" id="posPrintOrder"><i class="bi bi-printer"></i> Recibo</button>`;
    $('posPrintOrder').onclick = () => printOrderReceipt(o);

    const rows = reqRows();
    req.innerHTML = `<table class="pos-req"><thead><tr><th>Prenda</th><th>Talla</th><th>Pedidas</th><th>Escaneadas</th></tr></thead><tbody>` +
      rows.map((r) => `<tr><td>${esc(r.name || r.id)}</td><td>${esc(r.size)}</td><td>${r.req}</td>` +
        `<td class="${r.got === r.req ? 'ok' : 'pend'}">${r.got}${r.got === r.req ? ' ✓' : ''}</td></tr>`).join('') +
      '</tbody></table>';
    $('posOrderItems').innerHTML = S.orderScans.length ? S.orderScans.map(itemRow).join('') : EMPTY;
    $('posOrderCount').textContent = S.orderScans.length ? S.orderScans.length + '' : '';
    const complete = rows.length > 0 && rows.every((r) => r.got === r.req) && S.orderScans.length > 0;
    $('posOrderOk').disabled = !complete;
    $('posOrderClear').disabled = !S.orderScans.length;
  }

  function addOrderScan(u) {
    if (!S.order) { msg('Primero elige un pedido.', 'err'); return; }
    if (S.orderScans.some((c) => c.code === u.code)) { msg(u.code + ' ya estaba escaneada.', 'err'); return; }
    const row = reqRows().find((r) => r.id === u.product_id && r.size === String(u.size).toUpperCase());
    if (!row || row.got >= row.req) {
      msg(`${u.name} talla ${u.size} no corresponde a lo que pidió este cliente (o ya está completa).`, 'err'); return;
    }
    S.orderScans.push(u); renderOrder();
    msg(`${u.name} · talla ${u.size} ✓`, 'ok');
  }

  async function confirmOrder() {
    if (!S.order || !S.orderScans.length || S.busy) return;
    S.busy = true; $('posOrderOk').disabled = true;
    try {
      const o = S.order;
      const { data, error } = await sb.rpc('fulfill_order', { p_order_id: String(o.id), p_codes: S.orderScans.map((u) => u.code) });
      if (error) throw error;
      S.orderScans = [];
      const L = $('posOrderLast'); L.hidden = false;
      L.innerHTML = `<b><i class="bi bi-check-circle-fill"></i> Pedido ${esc(data.order_id)} confirmado</b> · ${data.units} prenda(s) · ya cuenta en los ingresos`;
      msg('Pedido confirmado: ' + data.order_id, 'ok'); say('Pedido ' + data.order_id + ' confirmado');
      if (typeof cargarPedidos === 'function') cargarPedidos();
      refreshIncome();
      await loadOrders();
    } catch (e) {
      msg(errMsg(e), 'err'); fail(errMsg(e)); renderOrder();
    } finally { S.busy = false; focusScan(); }
  }

  /* ═══════════════════════════════════════════════════════════
     ETIQUETAS
  ═══════════════════════════════════════════════════════════ */
  async function loadProducts() {
    const { data, error } = await sb.from('products').select('id,name,price,stock').order('name');
    if (error) { console.error(error); return; }
    S.products = data || [];
    $('labProd').innerHTML = S.products.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  }
  const pname = (id) => (S.products.find((p) => String(p.id) === String(id)) || {}).name || id;
  const pprice = (id) => (S.products.find((p) => String(p.id) === String(id)) || {}).price || 0;
  const toLabel = (u) => ({ code: u.code, name: u.name || pname(u.product_id), size: u.size, price: u.price != null ? u.price : pprice(u.product_id) });

  async function genLabels() {
    const qty = Math.floor(Number($('labQty').value));
    if (!(qty >= 1 && qty <= 200)) { fail('La cantidad debe estar entre 1 y 200.'); return; }
    const pid = $('labProd').value; if (!pid) { fail('Elige un producto.'); return; }
    $('labGen').disabled = true;
    try {
      const { data, error } = await sb.rpc('generate_units', { p_product_id: pid, p_size: $('labSize').value, p_qty: qty });
      if (error) throw error;
      S.lastLabels = (data || []).map((r) => ({ code: r.code, name: r.product_name, size: r.size, price: r.price }));
      $('labReprint').hidden = !S.lastLabels.length;
      renderLabPreview(S.lastLabels);
      say(S.lastLabels.length + ' etiqueta(s) creadas');
      printLabels(S.lastLabels);
      loadRecent();
    } catch (e) { fail(errMsg(e)); } finally { $('labGen').disabled = false; }
  }

  async function deleteUnusedLabels() {
    const button = $('labDeleteUnused');
    if (button.disabled) return;
    if (!window.confirm('Se eliminarán hasta 50 etiquetas que sigan en stock. Las etiquetas vendidas no se tocarán.')) return;
    if (window.prompt('Para confirmar, escribe exactamente: ELIMINAR ETIQUETAS') !== 'ELIMINAR ETIQUETAS') {
      fail('Eliminación cancelada; las etiquetas siguen intactas.');
      return;
    }

    button.disabled = true;
    try {
      const { data, error } = await sb.rpc('delete_unused_units', { p_limit: 50 });
      if (error) throw error;
      if (!Number.isInteger(data) || data < 0 || data > 50) {
        throw new Error('Supabase devolvió una cantidad de etiquetas no válida.');
      }
      say(`${data} etiqueta(s) sin vender eliminada(s).`);
      loadRecent();
    } catch (e) {
      fail('No se pudieron eliminar las etiquetas: ' + errMsg(e));
    } finally {
      button.disabled = false;
    }
  }

  function barcodeSVG(code, opts) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, code, Object.assign({ format: 'CODE128', width: 2, height: 46, displayValue: false, margin: 0 }, opts || {}));
    const w = svg.getAttribute('width'), h = svg.getAttribute('height');
    if (!svg.getAttribute('viewBox') && w && h) svg.setAttribute('viewBox', `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.removeAttribute('style');
    return svg.outerHTML;
  }

  function renderLabPreview(list) {
    const box = $('labPreview');
    if (!list.length) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = list.slice(0, 12).map((l) =>
      `<div class="lab-card"><div class="t">K1KO</div><div class="n">${esc(l.name)}</div><div class="s">Talla ${esc(l.size)} · ${money(l.price)}</div>${barcodeSVG(l.code)}<div class="c">${esc(l.code)}</div></div>`).join('') +
      (list.length > 12 ? `<div class="pos-orderinfo">…y ${list.length - 12} más</div>` : '');
  }

  async function loadRecent() {
    let q = sb.from('product_units').select('code,product_id,size,status,created_at').order('created_at', { ascending: false }).order('code', { ascending: false }).limit(60);
    if ($('labOnlyStock').checked) q = q.eq('status', 'en_stock');
    const { data, error } = await q;
    if (error) { console.error(error); return; }
    S.recent = (data || []).map((u) => Object.assign({}, u, { name: pname(u.product_id), price: pprice(u.product_id) }));
    $('labRecent').innerHTML = S.recent.length ? S.recent.map((u) =>
      `<tr><td><code>${esc(u.code)}</code></td><td>${esc(u.name)}</td><td>${esc(u.size)}</td>` +
      `<td><span class="pos-pill ${u.status === 'en_stock' ? 'ok' : 'off'}">${u.status === 'en_stock' ? 'En stock' : 'Vendida'}</span></td>` +
      `<td><button class="pos-btn ghost sm" type="button" data-reprint="${esc(u.code)}"><i class="bi bi-printer"></i></button></td></tr>`).join('')
      : '<tr><td colspan="5" style="text-align:center;color:var(--sub);padding:1.5rem">Aún no has creado etiquetas.</td></tr>';
  }

  /* ═══════════════════════════════════════════════════════════
     VENTAS / INGRESOS
  ═══════════════════════════════════════════════════════════ */
  async function loadSales() {
    const { data, error } = await sb.from('sales').select('*').order('created_at', { ascending: false }).limit(60);
    if (error) { console.error(error); return; }
    S.sales = data || [];
    const hoy = S.sales.filter((s) => s.estado === 'completada' && bogotaDay(s.created_at) === bogotaDay(new Date().toISOString()));
    $('posVentasHoy').textContent = `Hoy: ${hoy.length} · ${money(hoy.reduce((a, s) => a + Number(s.total), 0))}`;
    $('posVentas').innerHTML = S.sales.length ? S.sales.map((s) => {
      const n = Array.isArray(s.items) ? s.items.length : 0;
      return `<tr><td><b>${esc(s.sale_number)}</b></td><td>${esc(fecha(s.created_at))}</td><td>${n}</td><td>${esc(s.metodo_pago)}</td>` +
        `<td style="text-align:right">${money(s.total)}</td>` +
        `<td><span class="pos-pill ${s.estado === 'completada' ? 'ok' : 'off'}">${esc(s.estado)}</span></td>` +
        `<td style="white-space:nowrap"><button class="pos-btn ghost sm" type="button" data-print-sale="${esc(s.id)}"><i class="bi bi-printer"></i></button> ` +
        (s.estado === 'completada' ? `<button class="pos-btn danger sm" type="button" data-void="${esc(s.id)}">Anular</button>` : '') + '</td></tr>';
    }).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--sub);padding:1.5rem">Todavía no hay ventas.</td></tr>';
  }
  function bogotaDay(iso) { return new Date(new Date(iso).getTime() - 5 * 3600e3).toISOString().slice(0, 10); }

  async function voidSale(id) {
    const s = S.sales.find((x) => x.id === id); if (!s) return;
    if (!confirm(`¿Anular la venta ${s.sale_number} por ${money(s.total)}?\nLas prendas volverán al stock.`)) return;
    try {
      const { error } = await sb.rpc('void_sale', { p_sale_id: id });
      if (error) throw error;
      say('Venta anulada'); await loadSales(); refreshIncome(); if (typeof cargarStock === 'function') cargarStock();
    } catch (e) { fail(errMsg(e)); }
  }

  async function refreshIncome() {
    try {
      const off = -5 * 3600e3, now = new Date(Date.now() + off);
      const y = now.getUTCFullYear(), m = now.getUTCMonth(), d = now.getUTCDate();
      const startDay = new Date(Date.UTC(y, m, d) - off), endDay = new Date(startDay.getTime() + 864e5);
      const startMon = new Date(Date.UTC(y, m, 1) - off), endMon = new Date(Date.UTC(y, m + 1, 1) - off);
      const [a, b] = await Promise.all([
        sb.rpc('income_summary', { p_desde: startDay.toISOString(), p_hasta: endDay.toISOString() }),
        sb.rpc('income_summary', { p_desde: startMon.toISOString(), p_hasta: endMon.toISOString() })
      ]);
      if (a.error || b.error) return;   // sin instalar: se deja el guion
      const day = a.data, mon = b.data;
      $('ing-hoy').textContent = money(day.total);
      $('ing-hoy-n').textContent = `${day.count} venta${day.count === 1 ? '' : 's'} · online ${money(day.online_total)} · mostrador ${money(day.store_total)}`;
      $('ing-mes').textContent = money(mon.total);
      $('ing-mes-n').textContent = `${mon.count} venta${mon.count === 1 ? '' : 's'} · online ${money(mon.online_total)}`;
      $('ing-mostrador').textContent = money(mon.store_total);
      $('ing-mostrador-n').textContent = `${mon.store_count} venta${mon.store_count === 1 ? '' : 's'} con el escáner`;
    } catch (e) { console.error(e); }
  }

  /* ═══════════════════════════════════════════════════════════
     CÁMARA (opcional, si el navegador soporta BarcodeDetector)
  ═══════════════════════════════════════════════════════════ */
  let camStream = null, camTimer = null, lastSeen = { c: '', t: 0 };
  function dockCamera(tab) {
    const camera = $('posCam');
    const items = $(tab === 'pedido' ? 'posOrderItems' : 'posItems');
    if (camera && items) items.parentElement.insertBefore(camera, items);
  }

  async function startCamera() {
    if (camStream) return;
    if (!('BarcodeDetector' in window) || !navigator.mediaDevices) {
      msg('Tu navegador no puede leer códigos con la cámara. Usa Chrome en Android/PC o un lector USB/Bluetooth.', 'err'); return;
    }
    try {
      const det = new BarcodeDetector({ formats: ['code_128'] });
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const v = document.createElement('video');
      v.setAttribute('playsinline', ''); v.muted = true; v.srcObject = camStream;
      $('posCamView').innerHTML = ''; $('posCamView').appendChild(v);
      dockCamera(S.tab);
      $('posCam').hidden = false; await v.play();
      camTimer = setInterval(async () => {
        try {
          const r = await det.detect(v);
          if (!r.length) return;
          const c = normCode(r[0].rawValue), now = Date.now();
          if (c === lastSeen.c && now - lastSeen.t < 2500) return;
          lastSeen = { c, t: now }; onScan(c);
        } catch (e) { /* frame no listo */ }
      }, 250);
    } catch (e) { msg('No se pudo abrir la cámara: ' + errMsg(e), 'err'); stopCamera(); }
  }
  function stopCamera() {
    clearInterval(camTimer); camTimer = null;
    if (camStream) camStream.getTracks().forEach((t) => t.stop());
    camStream = null;
    const c = $('posCam'); if (c) { c.hidden = true; $('posCamView').innerHTML = ''; }
  }

  /* ═══════════════════════════════════════════════════════════
     IMPRESIÓN (recibos térmicos y etiquetas)
     Se imprime desde un iframe oculto con su propio @page, así el
     diálogo de impresión usa el tamaño exacto del rollo.
  ═══════════════════════════════════════════════════════════ */
  function printHTML(html, fitWidthMM) {
    const old = document.getElementById('k1PrintFrame'); if (old) old.remove();
    const f = document.createElement('iframe');
    f.id = 'k1PrintFrame';
    f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(f);
    const d = f.contentWindow.document;
    d.open(); d.write(html); d.close();
    const go = () => {
      if (fitWidthMM) {   // rollo continuo: página = ancho del rollo × alto real del recibo
        try {
          const h = Math.ceil(d.body.getBoundingClientRect().height * 25.4 / 96) + 6;
          const st = d.getElementById('pg'); if (st) st.textContent = `@page{size:${fitWidthMM}mm ${h}mm;margin:0}`;
        } catch (e) { /* se imprime con el tamaño por defecto */ }
      }
      try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { fail('No se pudo abrir la impresión.'); } };
    setTimeout(go, 250);
    return f;
  }

  const paperMM = () => ($('posPaper').value === '58' ? 58 : 80);

  function receiptDoc(inner) {
    const w = paperMM(), small = w === 58;
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Recibo K1KO</title><style id="pg">@page{size:${w}mm 200mm;margin:0}</style><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body { width: ${w}mm; padding: 3mm ${small ? 2 : 3}mm 6mm; font: ${small ? 10 : 11.5}px/1.35 "Courier New", ui-monospace, monospace; color: #000; }
      .c { text-align: center; } .r { text-align: right; } .b { font-weight: 700; }
      h1 { margin: 0; font: 900 ${small ? 24 : 30}px/1 Arial Black, Impact, sans-serif; letter-spacing: 3px; text-align: center; }
      .sub { text-align: center; font-size: ${small ? 8.5 : 9.5}px; letter-spacing: 1.5px; margin: 1mm 0 2mm; }
      hr { border: 0; border-top: 1px dashed #000; margin: 2mm 0; }
      .row { display: flex; justify-content: space-between; gap: 2mm; }
      .it { margin: 1.2mm 0; } .it .n { font-weight: 700; word-break: break-word; }
      .it .d { font-size: ${small ? 9 : 10}px; display: flex; justify-content: space-between; gap: 2mm; }
      .tot { font-size: ${small ? 14 : 17}px; font-weight: 900; }
      svg { display: block; width: 100%; height: 12mm; margin: 2mm 0 0; }
      .k { text-align: center; font-size: ${small ? 9 : 10}px; letter-spacing: 2px; }
    </style></head><body>${inner}</body></html>`;
  }

  const head = (titulo, num, date, extra) => `
    <h1>K1KO</h1><div class="sub">STREETWEAR PREMIUM</div>
    <hr><div class="c b">${esc(titulo)}</div>
    <div class="row"><span>N°</span><span class="b">${esc(num)}</span></div>
    <div class="row"><span>Fecha</span><span>${esc(date)}</span></div>${extra || ''}<hr>`;

  function printSaleReceipt(s) {
    const items = Array.isArray(s.items) ? s.items : [];
    const body = head('RECIBO DE VENTA', s.sale_number, fecha(s.created_at),
      s.cliente ? `<div class="row"><span>Cliente</span><span>${esc(s.cliente)}</span></div>` : '') +
      items.map((i) => `<div class="it"><div class="n">${esc(i.name)}</div><div class="d"><span>Talla ${esc(i.size)} · ${esc(i.code)}</span><span>${money(i.price)}</span></div></div>`).join('') +
      `<hr><div class="row"><span>Prendas</span><span>${items.length}</span></div>` +
      `<div class="row tot"><span>TOTAL</span><span>${money(s.total)}</span></div><hr>` +
      `<div class="row"><span>Pago</span><span>${esc(s.metodo_pago)}</span></div>` +
      (s.recibido != null ? `<div class="row"><span>Recibido</span><span>${money(s.recibido)}</span></div><div class="row"><span>Cambio</span><span>${money(s.cambio || 0)}</span></div>` : '') +
      (s.estado === 'anulada' ? '<hr><div class="c b">*** VENTA ANULADA ***</div>' : '') +
      `<hr>${barcodeSVG(s.sale_number, { height: 40, width: 2 })}<div class="k">${esc(s.sale_number)}</div>` +
      '<hr><div class="c b">¡GRACIAS POR TU COMPRA!</div><div class="c">K1KO · Streetwear Premium</div>';
    printHTML(receiptDoc(body), paperMM());
  }

  function printOrderReceipt(o) {
    const items = parseItems(o);
    const body = head('RECIBO PEDIDO ONLINE', o.order_id, fecha(o.created_at),
      `<div class="row"><span>Cliente</span><span>${esc(o.cliente)}</span></div>` +
      (o.celular ? `<div class="row"><span>Cel.</span><span>${esc(o.celular)}</span></div>` : '') +
      (o.ciudad ? `<div class="row"><span>Ciudad</span><span>${esc(o.ciudad)}</span></div>` : '')) +
      items.map((i) => `<div class="it"><div class="n">${esc(i.name)}</div><div class="d"><span>Talla ${esc(i.size)} × ${esc(i.qty)}</span><span>${money(Number(i.price) * Number(i.qty))}</span></div></div>`).join('') +
      '<hr>' +
      (o.subtotal != null ? `<div class="row"><span>Subtotal</span><span>${money(o.subtotal)}</span></div>` : '') +
      (o.costo_envio != null ? `<div class="row"><span>Envío</span><span>${Number(o.costo_envio) === 0 ? 'GRATIS' : money(o.costo_envio)}</span></div>` : '') +
      `<div class="row tot"><span>TOTAL</span><span>${money(o.total)}</span></div><hr>` +
      `<div class="row"><span>Pago</span><span>${esc(o.metodo_pago || '')}</span></div>` +
      `<div class="row"><span>Estado</span><span>${esc(o.estado)}</span></div>` +
      (o.direccion ? `<hr><div class="b">Envío a:</div><div>${esc(o.recibe || o.cliente)}<br>${esc(o.direccion)}${o.barrio ? ', ' + esc(o.barrio) : ''}<br>${esc(o.ciudad || '')}</div>` : '') +
      `<hr>${barcodeSVG(String(o.order_id), { height: 40, width: 1.6 })}<div class="k">${esc(o.order_id)}</div>` +
      '<hr><div class="c b">¡GRACIAS POR TU COMPRA!</div><div class="c">K1KO · Streetwear Premium</div>';
    printHTML(receiptDoc(body), paperMM());
  }

  function printLabels(list) {
    if (!list || !list.length) { fail('No hay etiquetas para imprimir.'); return; }
    const fmt = $('labFmt').value;
    const dims = { '50x30': [50, 30], '60x40': [60, 40] }[fmt];
    const label = (l, big) => `<div class="lb"><div class="top"><b>K1KO</b><span>Talla ${esc(l.size)}</span></div>` +
      `<div class="nm">${esc(l.name)}</div>${barcodeSVG(l.code, { height: 40 })}<div class="cd">${esc(l.code)}</div>` +
      `<div class="pr">${money(l.price)}</div></div>`;
    let css, body;
    if (fmt === 'a4') {
      css = `@page{size:A4;margin:0} body{padding:0}
        .sheet{display:grid;grid-template-columns:repeat(3,70mm);grid-auto-rows:37.125mm;page-break-after:always;width:210mm}
        .lb{padding:3mm 4mm;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between}`;
      const pages = []; for (let i = 0; i < list.length; i += 24) pages.push(list.slice(i, i + 24));
      body = pages.map((p) => `<div class="sheet">${p.map((l) => label(l)).join('')}</div>`).join('');
    } else {
      css = `@page{size:${dims[0]}mm ${dims[1]}mm;margin:0} body{width:${dims[0]}mm}
        .lb{width:${dims[0]}mm;height:${dims[1]}mm;padding:${dims[1] < 35 ? 1.6 : 2.5}mm 2.5mm;overflow:hidden;page-break-after:always;display:flex;flex-direction:column;justify-content:space-between}`;
      body = list.map((l) => label(l)).join('');
    }
    printHTML(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Etiquetas K1KO</title><style>
      *{box-sizing:border-box} html,body{margin:0;padding:0;background:#fff;color:#000;font-family:Arial,sans-serif}
      .top{display:flex;justify-content:space-between;align-items:baseline;font-size:9px;letter-spacing:1px}
      .top b{font:900 12px Arial Black,Impact,sans-serif;letter-spacing:2px}
      .nm{font-size:8.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      svg{display:block;width:100%;height:${fmt === '50x30' ? 9 : 12}mm}
      .cd{font:700 9px "Courier New",monospace;text-align:center;letter-spacing:2px}
      .pr{font-size:9px;text-align:right;font-weight:700}
      ${css}</style></head><body>${body}</body></html>`);
  }

  /* ── API pública para admin.js ──────────────────────────── */
  window.K1POS = { init, refreshIncome, printOrderReceipt, stop: stopCamera };
})();