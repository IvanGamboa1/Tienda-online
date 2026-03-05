/* ══════════════════════════════════════════════════════════════
   SUPABASE CONFIG
══════════════════════════════════════════════════════════════ */
const SUPABASE_URL = "https://oasuoihjkoaaxajwjleo.supabase.co";
const SUPABASE_KEY = "sb_publishable_f_LGWDnVb0Gu7oM4NV2imA_iuNmon1I";
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ══════════════════════════════════════════════════════════════
   CONFIGURACIÓN GENERAL
   ► Cambia PAYMENT_PHONE para actualizar todos los banners de pago
══════════════════════════════════════════════════════════════ */
const WHATSAPP_NUMBER = '573128462280';
const PAYMENT_PHONE   = '3148547565';   // ← número único para Nequi / Daviplata / Bancolombia

/* ══════════════════════════════════════════════════════════════
   CIUDADES DE COLOMBIA (envío por carretera)
   Zonas: free = Buenaventura, near = Valle+Chocó, std = Nacional
══════════════════════════════════════════════════════════════ */
const CIUDADES = [
  // ── VALLE DEL CAUCA ──
  {name:'Buenaventura',dept:'Valle del Cauca',zone:'free',days:'Mismo día / 24h',cost:0,carrier:'Domiciliario propio'},
  {name:'Cali',dept:'Valle del Cauca',zone:'near',days:'1-2 días',cost:8000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Palmira',dept:'Valle del Cauca',zone:'near',days:'1-2 días',cost:8000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Buga',dept:'Valle del Cauca',zone:'near',days:'1-2 días',cost:9000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Tuluá',dept:'Valle del Cauca',zone:'near',days:'1-2 días',cost:9000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Cartago',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:10000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Jamundí',dept:'Valle del Cauca',zone:'near',days:'1-2 días',cost:8000,carrier:'Interrapidísimo'},
  {name:'Yumbo',dept:'Valle del Cauca',zone:'near',days:'1-2 días',cost:8000,carrier:'Interrapidísimo'},
  {name:'Candelaria',dept:'Valle del Cauca',zone:'near',days:'1-2 días',cost:8500,carrier:'Interrapidísimo'},
  {name:'Florida',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:9000,carrier:'Interrapidísimo'},
  {name:'Pradera',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:9000,carrier:'Interrapidísimo'},
  {name:'El Cerrito',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:9000,carrier:'Interrapidísimo'},
  {name:'Guacarí',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:9500,carrier:'Interrapidísimo'},
  {name:'Ginebra',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:9500,carrier:'Interrapidísimo'},
  {name:'Roldanillo',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:10000,carrier:'Interrapidísimo'},
  {name:'La Unión',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:10000,carrier:'Interrapidísimo'},
  {name:'Zarzal',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:10000,carrier:'Interrapidísimo'},
  {name:'Dagua',dept:'Valle del Cauca',zone:'near',days:'1-2 días',cost:8500,carrier:'Interrapidísimo'},
  {name:'La Cumbre',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:9000,carrier:'Interrapidísimo'},
  {name:'Restrepo',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:9000,carrier:'Interrapidísimo'},
  {name:'Calima-El Darién',dept:'Valle del Cauca',zone:'near',days:'2 días',cost:9500,carrier:'Interrapidísimo'},
  // ── CHOCÓ ──
  {name:'Quibdó',dept:'Chocó',zone:'near',days:'2-3 días',cost:12000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Istmina',dept:'Chocó',zone:'near',days:'2-3 días',cost:13000,carrier:'Interrapidísimo'},
  {name:'Tadó',dept:'Chocó',zone:'near',days:'2-3 días',cost:13000,carrier:'Interrapidísimo'},
  {name:'Condoto',dept:'Chocó',zone:'near',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  // ── BOGOTÁ / CUNDINAMARCA ──
  {name:'Bogotá',dept:'Cundinamarca',zone:'std',days:'2-3 días',cost:13000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Soacha',dept:'Cundinamarca',zone:'std',days:'2-3 días',cost:13000,carrier:'Interrapidísimo'},
  {name:'Facatativá',dept:'Cundinamarca',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  {name:'Girardot',dept:'Cundinamarca',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  {name:'Zipaquirá',dept:'Cundinamarca',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  {name:'Fusagasugá',dept:'Cundinamarca',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  {name:'Chía',dept:'Cundinamarca',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  {name:'Mosquera',dept:'Cundinamarca',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  // ── ANTIOQUIA ──
  {name:'Medellín',dept:'Antioquia',zone:'std',days:'2-3 días',cost:12000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Bello',dept:'Antioquia',zone:'std',days:'2-3 días',cost:12000,carrier:'Interrapidísimo'},
  {name:'Itagüí',dept:'Antioquia',zone:'std',days:'2-3 días',cost:12000,carrier:'Interrapidísimo'},
  {name:'Envigado',dept:'Antioquia',zone:'std',days:'2-3 días',cost:12000,carrier:'Interrapidísimo'},
  {name:'Rionegro',dept:'Antioquia',zone:'std',days:'3 días',cost:13000,carrier:'Interrapidísimo'},
  {name:'Apartadó',dept:'Antioquia',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo'},
  {name:'Turbo',dept:'Antioquia',zone:'std',days:'3-4 días',cost:17000,carrier:'Interrapidísimo'},
  {name:'Caucasia',dept:'Antioquia',zone:'std',days:'3 días',cost:15000,carrier:'Interrapidísimo'},
  {name:'Sabaneta',dept:'Antioquia',zone:'std',days:'3 días',cost:12000,carrier:'Interrapidísimo'},
  {name:'Caldas',dept:'Antioquia',zone:'std',days:'3 días',cost:13000,carrier:'Interrapidísimo'},
  // ── ATLÁNTICO / BOLÍVAR ──
  {name:'Barranquilla',dept:'Atlántico',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Soledad',dept:'Atlántico',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo'},
  {name:'Cartagena',dept:'Bolívar',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Magangué',dept:'Bolívar',zone:'std',days:'4 días',cost:17000,carrier:'Interrapidísimo'},
  // ── SANTANDER ──
  {name:'Bucaramanga',dept:'Santander',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Floridablanca',dept:'Santander',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  {name:'Giron',dept:'Santander',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  {name:'Barrancabermeja',dept:'Santander',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo'},
  // ── NORTE DE SANTANDER ──
  {name:'Cúcuta',dept:'Norte de Santander',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo · Servientrega'},
  // ── CAUCA / NARIÑO ──
  {name:'Popayán',dept:'Cauca',zone:'std',days:'2 días',cost:10000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Santander de Quilichao',dept:'Cauca',zone:'std',days:'2 días',cost:9000,carrier:'Interrapidísimo'},
  {name:'Puerto Tejada',dept:'Cauca',zone:'std',days:'2 días',cost:9000,carrier:'Interrapidísimo'},
  {name:'Miranda',dept:'Cauca',zone:'std',days:'2 días',cost:9000,carrier:'Interrapidísimo'},
  {name:'Pasto',dept:'Nariño',zone:'std',days:'3 días',cost:13000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Ipiales',dept:'Nariño',zone:'std',days:'3-4 días',cost:15000,carrier:'Interrapidísimo'},
  {name:'Tumaco',dept:'Nariño',zone:'std',days:'3-4 días',cost:15000,carrier:'Interrapidísimo'},
  // ── EJE CAFETERO ──
  {name:'Pereira',dept:'Risaralda',zone:'std',days:'2-3 días',cost:11000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Dosquebradas',dept:'Risaralda',zone:'std',days:'2-3 días',cost:11000,carrier:'Interrapidísimo'},
  {name:'Santa Rosa de Cabal',dept:'Risaralda',zone:'std',days:'2-3 días',cost:12000,carrier:'Interrapidísimo'},
  {name:'Manizales',dept:'Caldas',zone:'std',days:'2-3 días',cost:12000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Chinchiná',dept:'Caldas',zone:'std',days:'2-3 días',cost:12000,carrier:'Interrapidísimo'},
  {name:'Armenia',dept:'Quindío',zone:'std',days:'2-3 días',cost:11000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Calarcá',dept:'Quindío',zone:'std',days:'2-3 días',cost:11000,carrier:'Interrapidísimo'},
  {name:'Montenegro',dept:'Quindío',zone:'std',days:'2-3 días',cost:12000,carrier:'Interrapidísimo'},
  // ── HUILA / TOLIMA ──
  {name:'Neiva',dept:'Huila',zone:'std',days:'3 días',cost:13000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Pitalito',dept:'Huila',zone:'std',days:'3-4 días',cost:15000,carrier:'Interrapidísimo'},
  {name:'Ibagué',dept:'Tolima',zone:'std',days:'2-3 días',cost:12000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Espinal',dept:'Tolima',zone:'std',days:'3 días',cost:13000,carrier:'Interrapidísimo'},
  {name:'Melgar',dept:'Tolima',zone:'std',days:'3 días',cost:13000,carrier:'Interrapidísimo'},
  // ── BOYACÁ / LLANOS ──
  {name:'Tunja',dept:'Boyacá',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Duitama',dept:'Boyacá',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  {name:'Sogamoso',dept:'Boyacá',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo'},
  {name:'Villavicencio',dept:'Meta',zone:'std',days:'3 días',cost:14000,carrier:'Interrapidísimo · Servientrega'},
  // ── COSTA ATLÁNTICA ──
  {name:'Valledupar',dept:'Cesar',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Santa Marta',dept:'Magdalena',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Sincelejo',dept:'Sucre',zone:'std',days:'3-4 días',cost:17000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Montería',dept:'Córdoba',zone:'std',days:'3-4 días',cost:17000,carrier:'Interrapidísimo · Servientrega'},
  // ── LLANOS / OTRAS ──
  {name:'Yopal',dept:'Casanare',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Mocoa',dept:'Putumayo',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Florencia',dept:'Caquetá',zone:'std',days:'3-4 días',cost:16000,carrier:'Interrapidísimo · Servientrega'},
  {name:'Riohacha',dept:'La Guajira',zone:'std',days:'4 días',cost:18000,carrier:'Interrapidísimo · Servientrega'},
  {name:'San Andrés',dept:'San Andrés y Providencia',zone:'std',days:'5-7 días',cost:25000,carrier:'Avianca Cargo'},
];

/* ══════════════════════════════════════════════════════════════
   ESTADO GLOBAL
══════════════════════════════════════════════════════════════ */
const SVG_BLACK = `data:image/svg+xml;utf8,<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="500" fill="%230d0d0d"/><text x="300" y="220" font-family="sans-serif" font-size="90" font-weight="900" fill="rgba(255,255,255,0.06)" text-anchor="middle">K1KO</text><text x="300" y="290" font-family="sans-serif" font-size="22" fill="rgba(251,191,36,0.35)" text-anchor="middle" letter-spacing="8">SAND BLACK</text></svg>`;
const SVG_WHITE = `data:image/svg+xml;utf8,<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="500" fill="%23efefef"/><text x="300" y="220" font-family="sans-serif" font-size="90" font-weight="900" fill="rgba(0,0,0,0.06)" text-anchor="middle">K1KO</text><text x="300" y="290" font-family="sans-serif" font-size="22" fill="rgba(220,38,38,0.3)" text-anchor="middle" letter-spacing="8">SAND WHITE</text></svg>`;

const products = {};          // se llena desde Supabase
let currentProduct    = null;
let currentProductKey = null;
let cart              = [];   // se restaura desde localStorage al cargar
let currentStep       = 1;
let selectedPayMethod = '';
let modalQty          = 1;
let selectedCity      = null;

// ── ESTADO DEL UPLOADER ──
let uploadedFile = null;
let uploadedURL  = '';

/* ══════════════════════════════════════════════════════════════
   HELPER: COSTO DE ENVÍO ESCALADO POR CANTIDAD DE PRENDAS
   ─ zona free  → siempre $0
   ─ 1 prenda   → precio base
   ─ 2-3 prendas → base × 1.5  (redondeado a 500 COP)
   ─ 4+ prendas  → base × 2    (redondeado a 500 COP)
══════════════════════════════════════════════════════════════ */
function calcularEnvio(cityObj, totalPrendas) {
  if (!cityObj) return 0;
  if (cityObj.zone === 'free') return 0;
  const base = cityObj.cost;
  let factor = 1;
  if (totalPrendas >= 4)      factor = 2;
  else if (totalPrendas >= 2) factor = 1.5;
  const raw = base * factor;
  // Redondear al múltiplo de 500 más cercano
  return Math.ceil(raw / 500) * 500;
}

/* ══════════════════════════════════════════════════════════════
   HELPER: PERSISTENCIA DEL CARRITO EN localStorage
══════════════════════════════════════════════════════════════ */
function saveCartLS() {
  try { localStorage.setItem('kiko_cart', JSON.stringify(cart)); } catch(e) {}
}
function loadCartLS() {
  try {
    const raw = localStorage.getItem('kiko_cart');
    if (raw) cart = JSON.parse(raw);
  } catch(e) { cart = []; }
}
function clearCartLS() {
  try { localStorage.removeItem('kiko_cart'); } catch(e) {}
}

/* ══════════════════════════════════════════════════════════════
   HELPER: SPINNER GLOBAL DE CARGA (overlay sobre el checkout)
══════════════════════════════════════════════════════════════ */
function showOrderLoading(msg = 'Procesando tu pedido...') {
  let el = document.getElementById('order-loading-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'order-loading-overlay';
    el.innerHTML = `
      <div class="ol-box">
        <div class="ol-spinner"></div>
        <div class="ol-msg" id="ol-msg">${msg}</div>
      </div>`;
    document.body.appendChild(el);
    // Estilos inline para no depender de CSS externo
    const style = document.createElement('style');
    style.id = 'ol-styles';
    style.textContent = `
      #order-loading-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);
        backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;}
      .ol-box{display:flex;flex-direction:column;align-items:center;gap:1.2rem;padding:2.5rem 3rem;
        background:#111;border:1px solid rgba(251,191,36,.3);max-width:320px;text-align:center;}
      .ol-spinner{width:44px;height:44px;border:3px solid rgba(251,191,36,.15);
        border-top-color:#fbbf24;border-radius:50%;animation:ol-spin .7s linear infinite;}
      @keyframes ol-spin{to{transform:rotate(360deg)}}
      .ol-msg{font-family:'Montserrat',sans-serif;font-size:.88rem;font-weight:600;
        color:#e0e0e0;letter-spacing:.04em;line-height:1.5;}`;
    document.head.appendChild(style);
  } else {
    document.getElementById('ol-msg').textContent = msg;
  }
  el.style.display = 'flex';
}
function hideOrderLoading() {
  const el = document.getElementById('order-loading-overlay');
  if (el) el.style.display = 'none';
}

/* ══════════════════════════════════════════════════════════════
   CARGAR PRODUCTOS DESDE SUPABASE
══════════════════════════════════════════════════════════════ */
async function cargarProductosDesdeSupabase() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) { console.error('Error cargando productos:', error); return; }

  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  // Limpiar objeto products
  Object.keys(products).forEach(k => delete products[k]);

  data.forEach(prod => {
    products[prod.id] = {
      id:          prod.id,
      name:        prod.name,
      price:       prod.price,
      image:       prod.image,
      description: prod.description || '',   // ← columna description de Supabase
      itemNumber:  `Item: ${prod.id}`,
      stock:       prod.stock
    };

    const card = document.createElement('div');
    card.className = 'product-card';
    card.id = `card-${prod.id}`;
    card.setAttribute('onclick', `openProductModal('${prod.id}')`);
    card.innerHTML = `
      <div class="product-image-container">
        <span class="product-badge" id="badge-${prod.id}">Nuevo</span>
        <img src="${prod.image}" alt="${prod.name}" class="product-image">
      </div>
      <div class="product-info">
        <h3 class="product-name">${prod.name}</h3>
        <div class="product-price">$${Number(prod.price).toLocaleString('es-CO')} COP</div>
      </div>`;
    grid.appendChild(card);
  });

  updateProductCards();
}

// Escuchar cambios de stock en tiempo real
supabase.channel('stock-changes')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, () => {
    syncStockFromSupabase();
  })
  .subscribe();

/* ══════════════════════════════════════════════════════════════
   STOCK
══════════════════════════════════════════════════════════════ */

/** Cuántas unidades del producto PID hay actualmente en el carrito */
function qtyInCart(pid) {
  return cart.filter(i => i.productId === pid).reduce((s, i) => s + i.qty, 0);
}

/** Stock disponible real = stock Supabase − unidades ya en carrito */
function availableStock(pid) {
  return (products[pid]?.stock ?? 0) - qtyInCart(pid);
}

/** Descuenta stock en Supabase al confirmar el pedido */
async function descontarStockSupabase(productId, cantidad) {
  const { data, error } = await supabase
    .from('products').select('stock').eq('id', productId).single();
  if (error) { console.error('Error obteniendo stock:', error); return; }
  const nuevoStock = Math.max(data.stock - cantidad, 0);
  const { error: upErr } = await supabase
    .from('products').update({ stock: nuevoStock }).eq('id', productId);
  if (upErr) console.error('Error actualizando stock:', upErr);
}

/** Sincroniza el stock local con los valores actuales de Supabase */
async function syncStockFromSupabase() {
  const { data, error } = await supabase.from('products').select('id, stock');
  if (error) return;
  data.forEach(p => { if (products[p.id]) products[p.id].stock = p.stock; });
  updateProductCards();
}

/* ══════════════════════════════════════════════════════════════
   MODAL PRODUCTO
══════════════════════════════════════════════════════════════ */

/** Abre el modal de detalle para el producto con la clave `key` */
function openProductModal(key) {
  if (availableStock(key) <= 0) return;
  currentProductKey = key;
  currentProduct    = products[key];
  modalQty          = 1;

  document.getElementById('modalTitle').textContent       = currentProduct.name;
  document.getElementById('modalPrice').textContent       = `$${currentProduct.price.toLocaleString('es-CO')} COP`;
  document.getElementById('modalItemNumber').textContent  = currentProduct.itemNumber;
  document.getElementById('modalDescription').textContent = currentProduct.description;

  const img = document.getElementById('modalMainImage');
  const svg = document.getElementById('modalSvgPlaceholder');
  svg.style.display = 'none';
  img.style.display = 'block';
  img.src = currentProduct.image || currentProduct.previewSrc || '';
  img.alt = currentProduct.name;

  document.querySelectorAll('.modal-size-btn').forEach((b, i) => b.classList.toggle('selected', i === 1));
  renderModalQty();
  document.getElementById('productModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

/** Cierra el modal de producto */
function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
  document.body.style.overflow = 'auto';
}

/** Marca la talla seleccionada en el modal */
function selectModalSize(btn) {
  document.querySelectorAll('.modal-size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

/**
 * Renderiza el selector de cantidad en el modal.
 * Usa el stock real del producto (sin hardcode).
 */
function renderModalQty() {
  const avail    = availableStock(currentProductKey);
  const maxStock = products[currentProductKey]?.stock ?? 0;  // stock total del producto
  const qtyBlock = document.getElementById('modal-qty-block');
  if (!qtyBlock) return;

  if (avail <= 0) {
    qtyBlock.innerHTML = `<div style="padding:.8rem 1rem;background:rgba(220,38,38,.1);border:1px solid rgba(220,38,38,.4);color:#f87171;font-size:.82rem;font-weight:700;letter-spacing:1px;text-align:center;">PRODUCTO AGOTADO</div>`;
    const btn = document.getElementById('modal-add-cart-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="bi bi-x-circle"></i> AGOTADO`; }
    return;
  }

  const isLow = avail <= 2;
  const sc    = avail === 1 ? '#f87171' : isLow ? '#fbbf24' : '#4ade80';
  const sm    = avail === 1 ? '⚠️ ¡Última unidad!' : isLow ? `⚠️ ¡Solo ${avail} disponibles!` : `${avail} de ${maxStock} unidades disponibles`;

  qtyBlock.innerHTML = `
    <div style="padding:.55rem .9rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);margin-bottom:.9rem;">
      <span style="font-size:.78rem;color:${sc};font-weight:700;">${sm}</span>
    </div>
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;">
      <span style="font-size:.78rem;color:#a3a3a3;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Cantidad</span>
      <div style="display:flex;align-items:center;gap:.4rem;">
        <button onclick="changeModalQty(-1)" ${modalQty <= 1 ? 'disabled' : ''}
          style="width:38px;height:38px;border:2px solid ${modalQty<=1?'rgba(255,255,255,.08)':'rgba(255,255,255,.25)'};background:transparent;color:${modalQty<=1?'rgba(255,255,255,.2)':'#fff'};font-size:1.3rem;font-weight:700;cursor:${modalQty<=1?'not-allowed':'pointer'};display:flex;align-items:center;justify-content:center;">−</button>
        <div style="width:44px;height:38px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.15);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;">${modalQty}</div>
        <button onclick="changeModalQty(1)" ${modalQty >= avail ? 'disabled' : ''}
          style="width:38px;height:38px;border:2px solid ${modalQty>=avail?'rgba(255,255,255,.08)':'rgba(255,255,255,.25)'};background:transparent;color:${modalQty>=avail?'rgba(255,255,255,.2)':'#fff'};font-size:1.3rem;font-weight:700;cursor:${modalQty>=avail?'not-allowed':'pointer'};display:flex;align-items:center;justify-content:center;">+</button>
      </div>
      <span style="font-size:.72rem;color:#a3a3a3;">máx. ${avail}</span>
    </div>`;

  const btn = document.getElementById('modal-add-cart-btn');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-cart-plus-fill"></i> AGREGAR${modalQty > 1 ? ' ' + modalQty + ' uds —' : ''} $${(currentProduct.price * modalQty).toLocaleString('es-CO')} COP`;
  }
}

/** Cambia la cantidad en el modal (delta = +1 o -1) */
function changeModalQty(d) {
  const avail = availableStock(currentProductKey);
  modalQty = Math.min(Math.max(modalQty + d, 1), avail);
  renderModalQty();
}

/** Agrega el producto actual al carrito desde el modal */
function addToCartFromModal() {
  if (!currentProduct) return;
  const key   = currentProductKey;
  const avail = availableStock(key);
  if (avail <= 0 || modalQty < 1) return;

  const size     = document.querySelector('.modal-size-btn.selected')?.textContent || 'M';
  const existing = cart.find(i => i.productId === key && i.size === size);

  if (existing) {
    existing.qty = Math.min(existing.qty + modalQty, products[key].stock);
  } else {
    cart.push({
      id:        Date.now(),
      productId: key,
      name:      currentProduct.name,
      price:     currentProduct.price,
      size,
      qty:       modalQty,
      image:     currentProduct.image || currentProduct.previewSrc
    });
  }

  saveCartLS();
  updateCart();
  closeProductModal();
  setTimeout(toggleCart, 300);
}

/* ══════════════════════════════════════════════════════════════
   CARRITO
══════════════════════════════════════════════════════════════ */

/** Abre / cierra el sidebar del carrito */
function toggleCart() { document.getElementById('cartSidebar').classList.toggle('active'); }

/** Elimina un ítem del carrito por su ID */
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCartLS();
  updateCart();
}

/** Cambia la cantidad de un ítem en el carrito */
function cartChangeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const maxAllowed = Math.min(products[item.productId]?.stock ?? 0, availableStock(item.productId) + item.qty);
  const newQty = item.qty + delta;
  if (newQty < 1)          { removeFromCart(id); return; }
  if (newQty > maxAllowed) return;
  item.qty = newQty;
  saveCartLS();
  updateCart();
}

/** Re-renderiza todo el carrito (sidebar + badge + footer) */
function updateCart() {
  const items    = document.getElementById('cartItems');
  const footer   = document.getElementById('cartFooter');
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelector('.cart-count').textContent = totalQty;

  if (cart.length === 0) {
    items.innerHTML = `<div class="cart-empty"><i class="bi bi-bag-x"></i><p>Tu carrito está vacío</p></div>`;
    footer.style.display = 'none';
    updateProductCards();
    return;
  }

  items.innerHTML = cart.map(item => {
    const maxA = Math.min(products[item.productId]?.stock ?? 0, availableStock(item.productId) + item.qty);
    const atMax = item.qty >= maxA;
    return `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">Talla: <strong>${item.size}</strong></div>
        <div class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-CO')} COP</div>
        <div class="cart-qty-row">
          <button class="cqb" onclick="cartChangeQty(${item.id},-1)" ${item.qty <= 1 ? 'disabled' : ''}>−</button>
          <div class="cqn">${item.qty}</div>
          <button class="cqb" onclick="cartChangeQty(${item.id},1)" ${atMax ? 'disabled' : ''}>+</button>
          ${atMax ? `<span class="cqmax">máx. ${maxA}</span>` : ''}
        </div>
      </div>
      <i class="bi bi-trash remove-item" onclick="removeFromCart(${item.id})"></i>
    </div>`;
  }).join('');

  document.getElementById('cartTotal').textContent =
    `$${cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString('es-CO')} COP`;
  footer.style.display = 'block';
  updateProductCards();
}

/** Actualiza el badge/estado de cada tarjeta de producto según el stock disponible */
function updateProductCards() {
  Object.keys(products).forEach(key => {
    const card  = document.getElementById(`card-${key}`);
    const badge = document.getElementById(`badge-${key}`);
    if (!card || !badge) return;

    const avail = availableStock(key);
    const oos   = avail <= 0;

    if (oos) {
      card.classList.add('out-of-stock');
      card.setAttribute('onclick', '');
      badge.textContent = 'AGOTADO';
      badge.className   = 'product-badge badge-oos';
      if (!card.querySelector('.oos-overlay')) {
        const ov = document.createElement('div');
        ov.className = 'oos-overlay';
        ov.textContent = 'AGOTADO';
        card.querySelector('.product-image-container').appendChild(ov);
      }
    } else {
      card.classList.remove('out-of-stock');
      card.setAttribute('onclick', `openProductModal('${key}')`);
      const ov = card.querySelector('.oos-overlay');
      if (ov) ov.remove();
      if (avail <= 2) {
        badge.textContent = `¡Solo ${avail} disponible${avail > 1 ? 's' : ''}!`;
        badge.className   = 'product-badge badge-low';
      } else {
        badge.textContent = 'Nuevo';
        badge.className   = 'product-badge';
      }
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   CHECKOUT — APERTURA / CIERRE
══════════════════════════════════════════════════════════════ */

/** Abre el checkout y resetea todo el estado del flujo */
function openCheckout() {
  if (cart.length === 0) return;
  selectedCity = null;
  uploadedFile = null;
  uploadedURL  = '';
  fillSummary();
  document.getElementById('checkoutOverlay').classList.add('active');
  document.getElementById('cartSidebar').classList.remove('active');
  document.body.style.overflow = 'hidden';

  // Limpiar selector de ciudad
  const csi = document.getElementById('co-city-search');
  if (csi) csi.value = '';
  const csb = document.getElementById('co-city-box');
  if (csb) csb.style.display = 'none';
  const cdd = document.getElementById('co-city-dropdown');
  if (cdd) cdd.style.display = 'none';
  const cerr = document.getElementById('err-ciudad');
  if (cerr) cerr.textContent = '';

  goStep(1, true);
}

/** Cierra el checkout */
function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('active');
  document.body.style.overflow = 'auto';
}

/**
 * Rellena el panel de resumen del checkout.
 * El costo de envío se escala según la cantidad total de prendas.
 */
function fillSummary() {
  const sub         = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const qty         = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrendas = qty;
  const shipping    = calcularEnvio(selectedCity, totalPrendas);

  document.getElementById('co-item-count').textContent  = qty + ' producto' + (qty > 1 ? 's' : '');
  document.getElementById('co-subtotal').textContent    = '$' + sub.toLocaleString('es-CO');
  document.getElementById('co-total-final').textContent = '$' + (sub + shipping).toLocaleString('es-CO');

  const envioEl = document.getElementById('co-envio-val');
  if (envioEl) {
    if (!selectedCity) {
      envioEl.textContent = '—';
      envioEl.className   = '';
      envioEl.style.color = '#888';
    } else if (shipping === 0) {
      envioEl.textContent = 'Gratis';
      envioEl.className   = 'co-green';
      envioEl.style.color = '';
    } else {
      envioEl.textContent = `$${shipping.toLocaleString('es-CO')}`;
      envioEl.className   = '';
      envioEl.style.color = '#fbbf24';
    }
  }

  document.getElementById('co-summary-items').innerHTML = cart.map(item => `
    <div class="co-summary-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="co-summary-item-info">
        <div class="co-summary-item-name">${item.name}</div>
        <div class="co-summary-item-size">Talla: ${item.size} · Cant: ${item.qty}</div>
      </div>
      <div class="co-summary-item-price">$${(item.price * item.qty).toLocaleString('es-CO')}</div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════════════════════
   CHECKOUT — PASOS / VALIDACIÓN
══════════════════════════════════════════════════════════════ */

/**
 * Navega al paso indicado del checkout.
 * Si `force = true` omite la validación (útil al abrir el checkout).
 */
function goStep(step, force) {
  if (!force && step > currentStep && !validateStep(currentStep)) return;
  currentStep = step;

  document.querySelectorAll('.co-panel').forEach((p, i) =>
    p.classList.toggle('active', i + 1 === step));

  document.querySelectorAll('.co-step').forEach((d, i) => {
    d.classList.remove('active', 'done');
    if (i + 1 === step)     d.classList.add('active');
    else if (i + 1 < step)  d.classList.add('done');
  });

  document.querySelectorAll('.co-step-line').forEach((l, i) =>
    l.classList.toggle('done', i + 1 < step));

  document.getElementById('checkoutModal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Valida los campos del paso actual. Devuelve true si todo está OK. */
function validateStep(step) {
  let ok = true;

  function check(id, errId, msg) {
    const el  = document.getElementById(id);
    const val = el ? el.value.trim() : '';
    if (!val) {
      if (el) el.classList.add('invalid');
      const e = document.getElementById(errId);
      if (e) e.textContent = msg || 'Campo obligatorio.';
      ok = false;
    } else {
      if (el) el.classList.remove('invalid');
      const e = document.getElementById(errId);
      if (e) e.textContent = '';
    }
    return !!val;
  }

  if (step === 1) {
    const eok = check('co-email', 'err-email', 'Ingresa tu correo.');
    if (eok && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('co-email').value.trim())) {
      document.getElementById('co-email').classList.add('invalid');
      document.getElementById('err-email').textContent = 'Correo inválido.';
      ok = false;
    }
    check('co-nombre',      'err-nombre');
    check('co-apellido',    'err-apellido');
    const cok = check('co-celular', 'err-celular', 'Ingresa tu celular.');
    if (cok && !/^\d{10}$/.test(document.getElementById('co-celular').value.trim())) {
      document.getElementById('co-celular').classList.add('invalid');
      document.getElementById('err-celular').textContent = 'Debe tener 10 dígitos.';
      ok = false;
    }
    check('co-tipoDoc',     'err-tipoDoc',     'Selecciona tipo.');
    check('co-numDoc',      'err-numDoc',      'Ingresa número.');
    check('co-tipoFactura', 'err-tipoFactura', 'Selecciona factura.');
  }

  if (step === 2) {
    if (!selectedCity) {
      const e = document.getElementById('err-ciudad');
      if (e) e.textContent = 'Selecciona una ciudad de destino.';
      ok = false;
    } else {
      const e = document.getElementById('err-ciudad');
      if (e) e.textContent = '';
    }
    check('co-municipio', 'err-municipio', 'Ingresa barrio.');
    check('co-direccion', 'err-direccion', 'Ingresa dirección.');
    check('co-recibe',    'err-recibe',    'Ingresa nombre.');
  }

  if (step === 3) {
    if (!selectedPayMethod) ok = false;
    if (['nequi', 'daviplata', 'bancolombia'].includes(selectedPayMethod) && !uploadedFile) {
      const e = document.getElementById('err-comprobante');
      if (e) e.textContent = 'Adjuntá el comprobante de pago para continuar.';
      ok = false;
    }
  }

  return ok;
}

/* ══════════════════════════════════════════════════════════════
   SELECCIÓN DE MÉTODO DE PAGO
   ► PAYMENT_PHONE se usa en los tres métodos de transferencia
══════════════════════════════════════════════════════════════ */
function selectPay(label, method) {
  selectedPayMethod = method;
  document.querySelectorAll('.co-pay-opt').forEach(l => l.classList.remove('selected'));
  label.classList.add('selected');

  const refFields    = document.getElementById('refFields');
  const refBanner    = document.getElementById('refBanner');
  const altInfo      = document.getElementById('altInfo');
  const uploaderWrap = document.getElementById('uploaderWrap');

  refFields.style.display    = 'none';
  altInfo.style.display      = 'none';
  uploaderWrap.style.display = 'none';
  refBanner.className        = 'co-ref-banner';
  refBanner.innerHTML        = '';

  if (method === 'nequi') {
    refBanner.classList.add('nequi');
    refBanner.innerHTML = `<span>📱</span><span>Transfiere al <strong>${PAYMENT_PHONE}</strong> por Nequi y adjuntá el comprobante abajo.</span>`;
    refFields.style.display    = 'block';
    uploaderWrap.style.display = 'block';
  } else if (method === 'daviplata') {
    refBanner.classList.add('daviplata');
    refBanner.innerHTML = `<span>📱</span><span>Transfiere al <strong>${PAYMENT_PHONE}</strong> por Daviplata y adjuntá el comprobante abajo.</span>`;
    refFields.style.display    = 'block';
    uploaderWrap.style.display = 'block';
  } else if (method === 'bancolombia') {
    refBanner.classList.add('bancolombia');
    refBanner.innerHTML = `<span>🏦</span><span>Transfiere a la cuenta <strong>${PAYMENT_PHONE}</strong> Bancolombia y adjuntá el comprobante abajo.</span>`;
    refFields.style.display    = 'block';
    uploaderWrap.style.display = 'block';
  } else if (method === 'contraentrega') {
    altInfo.style.display = 'block';
    document.getElementById('altInfoText').textContent =
      'Pagas en efectivo al recibir. Domiciliario en 1 día hábil. Sin costo adicional.';
    resetUploader();
  }

  const e = document.getElementById('err-comprobante');
  if (e) e.textContent = '';
}

/* ══════════════════════════════════════════════════════════════
   UPLOADER DE COMPROBANTE
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const dz = document.getElementById('co-drop-zone');
  if (!dz) return;
  dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', ()  => dz.classList.remove('drag-over'));
  dz.addEventListener('drop',      e  => {
    e.preventDefault();
    dz.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) procesarComprobante(file);
  });
});

/** Maneja el evento `change` del input file del comprobante */
function handleComprobanteInput(input) {
  if (input.files[0]) procesarComprobante(input.files[0]);
}

/** Valida y almacena el archivo del comprobante */
function procesarComprobante(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
  if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|pdf)$/i)) {
    setErrComprobante('Formato no válido. Usá JPG, PNG, WEBP o PDF.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setErrComprobante('El archivo supera los 5 MB.');
    return;
  }
  setErrComprobante('');
  uploadedFile = file;
  mostrarPreviewComprobante(file);
}

/** Muestra la previsualización del comprobante seleccionado */
function mostrarPreviewComprobante(file) {
  const dz      = document.getElementById('co-drop-zone');
  const preview = document.getElementById('co-preview-wrap');
  const thumb   = document.getElementById('co-preview-thumb');
  const name    = document.getElementById('co-preview-name');
  const size    = document.getElementById('co-preview-size');

  name.textContent = file.name;
  size.textContent = formatSize(file.size);

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      thumb.src = e.target.result;
      thumb.style.display = 'block';
      const pdfIcon = preview.querySelector('.co-pdf-icon');
      if (pdfIcon) pdfIcon.remove();
    };
    reader.readAsDataURL(file);
  } else {
    thumb.style.display = 'none';
    let pdfIcon = preview.querySelector('.co-pdf-icon');
    if (!pdfIcon) {
      pdfIcon = document.createElement('span');
      pdfIcon.className = 'co-pdf-icon';
      pdfIcon.style.cssText = 'font-size:2.2rem;flex-shrink:0;';
      pdfIcon.textContent = '📄';
      preview.insertBefore(pdfIcon, preview.firstChild);
    }
  }

  dz.style.display      = 'none';
  preview.style.display = 'flex';
}

/** Quita el comprobante seleccionado y resetea el uploader */
function quitarComprobante() { resetUploader(); }

/** Resetea completamente el estado del uploader */
function resetUploader() {
  uploadedFile = null;
  uploadedURL  = '';
  const inp = document.getElementById('co-file-input');
  if (inp) inp.value = '';
  const dz      = document.getElementById('co-drop-zone');
  const preview = document.getElementById('co-preview-wrap');
  if (dz)      dz.style.display      = '';
  if (preview) preview.style.display = 'none';
  setErrComprobante('');
}

/** Muestra u oculta el mensaje de error del comprobante */
function setErrComprobante(msg) {
  const e = document.getElementById('err-comprobante');
  if (e) e.textContent = msg;
}

/** Formatea bytes a KB o MB legibles */
function formatSize(bytes) {
  if (bytes < 1024)          return bytes + ' B';
  if (bytes < 1024 * 1024)   return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ══════════════════════════════════════════════════════════════
   SELECTOR DE CIUDADES
══════════════════════════════════════════════════════════════ */

/** Abre el dropdown del selector de ciudades */
function openCityDropdown() {
  const dd = document.getElementById('co-city-dropdown');
  if (dd) dd.style.display = 'block';
  filterCities(document.getElementById('co-city-search')?.value || '');
}

/** Filtra las ciudades según el término de búsqueda */
function filterCities(term) {
  const dd   = document.getElementById('co-city-dropdown');
  const list = document.getElementById('co-city-list');
  if (!dd || !list) return;
  dd.style.display = 'block';

  const t        = term.toLowerCase().trim();
  const filtered = t.length < 1
    ? CIUDADES
    : CIUDADES.filter(c => c.name.toLowerCase().includes(t) || c.dept.toLowerCase().includes(t));

  if (!filtered.length) {
    list.innerHTML = `<div class="co-city-empty"><i class="bi bi-search"></i> Sin resultados para "${term}"</div>`;
    return;
  }

  const byDept = {};
  filtered.forEach(c => { if (!byDept[c.dept]) byDept[c.dept] = []; byDept[c.dept].push(c); });

  list.innerHTML = Object.entries(byDept).map(([dept, cities]) => `
    <div class="co-city-dept">📍 ${dept}</div>
    ${cities.map(c => {
      const tagTxt = c.zone === 'free' ? 'Gratis' : c.zone === 'near' ? 'Cercano' : 'Nacional';
      const tagCls = c.zone === 'free' ? 'co-city-tag-free' : c.zone === 'near' ? 'co-city-tag-near' : 'co-city-tag-std';
      return `<div class="co-city-opt" onclick="selectCity(${JSON.stringify(c).replace(/"/g, '&quot;')})">
        <div>
          <div class="co-city-name">${c.name}</div>
          <div class="co-city-sub">${c.dept}</div>
        </div>
        <span class="co-city-tag ${tagCls}">${tagTxt}</span>
      </div>`;
    }).join('')}
  `).join('');
}

/** Selecciona una ciudad del dropdown y actualiza la UI */
function selectCity(city) {
  selectedCity = city;
  const csi = document.getElementById('co-city-search');
  if (csi) csi.value = city.name + ', ' + city.dept;
  const clr = document.getElementById('co-city-clear');
  if (clr) clr.style.display = 'flex';
  const dd = document.getElementById('co-city-dropdown');
  if (dd) dd.style.display = 'none';
  const err = document.getElementById('err-ciudad');
  if (err) err.textContent = '';

  const box = document.getElementById('co-city-box');
  if (box) {
    box.style.display = 'block';
    document.getElementById('co-city-box-name').textContent = city.name;
    document.getElementById('co-city-box-dept').textContent = city.dept;
    document.getElementById('co-city-box-time').textContent = city.days;
    document.getElementById('co-city-box-type').textContent =
      city.name === 'San Andrés' ? 'Aéreo' : 'Terrestre · Carretera';

    const totalPrendas = cart.reduce((s, i) => s + i.qty, 0);
    const costoCalculado = calcularEnvio(city, totalPrendas);
    const costEl = document.getElementById('co-city-box-cost');
    costEl.textContent = costoCalculado === 0
      ? '¡GRATIS!'
      : `$${costoCalculado.toLocaleString('es-CO')} COP`;
    costEl.style.color = costoCalculado === 0 ? '#25D366' : '#fbbf24';

    document.getElementById('co-city-box-carrier').textContent = city.carrier;
  }

  fillSummary();
}

/** Limpia la ciudad seleccionada */
function clearCity() {
  selectedCity = null;
  const csi = document.getElementById('co-city-search');
  if (csi) csi.value = '';
  const clr = document.getElementById('co-city-clear');
  if (clr) clr.style.display = 'none';
  const box = document.getElementById('co-city-box');
  if (box) box.style.display = 'none';
  fillSummary();
}

// Cerrar dropdown de ciudades al clicar fuera
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('co-city-wrap');
  const dd   = document.getElementById('co-city-dropdown');
  if (wrap && dd && !wrap.contains(e.target)) dd.style.display = 'none';
});

/* ══════════════════════════════════════════════════════════════
   CONFIRMAR PEDIDO
   1. Valida el paso 3
   2. Verifica stock en Supabase en tiempo real
   3. Sube comprobante a Storage
   4. Descuenta stock
   5. Guarda pedido en orders
   6. Muestra pantalla de éxito
══════════════════════════════════════════════════════════════ */
async function confirmOrder() {
  if (!validateStep(3)) return;

  showOrderLoading('Verificando disponibilidad...');

  // ── 1. Verificar stock actual en Supabase ──
  const { data: stockData, error: stockErr } = await supabase
    .from('products').select('id, stock, name');
  if (stockErr) {
    hideOrderLoading();
    alert('Error al verificar el stock. Revisa tu conexión e intenta de nuevo.');
    return;
  }

  const stockMap = {};
  stockData.forEach(p => { stockMap[p.id] = p; });

  for (const item of cart) {
    const disponible = stockMap[item.productId]?.stock ?? 0;
    if (item.qty > disponible) {
      hideOrderLoading();
      const nombre = stockMap[item.productId]?.name || item.name;
      alert(`⚠️ Lo sentimos, "${nombre}" ya no tiene suficiente stock.\nDisponible: ${disponible} unidad${disponible !== 1 ? 'es' : ''}.\n\nActualiza tu carrito e intenta de nuevo.`);
      await syncStockFromSupabase();
      updateCart();
      return;
    }
  }

  const g = id => document.getElementById(id)?.value.trim() || '';
  const nombre    = g('co-nombre');
  const apellido  = g('co-apellido');
  const email     = g('co-email');
  const celular   = g('co-celular');
  const tipoDoc   = g('co-tipoDoc');
  const numDoc    = g('co-numDoc');
  const tipoFact  = document.getElementById('co-tipoFactura').value === 'empresa' ? 'Empresa / NIT' : 'Persona Natural';
  const barrio    = g('co-municipio');
  const direccion = g('co-direccion');
  const adicional = g('co-adicional');
  const recibe    = g('co-recibe');
  const metPago   = { nequi: 'Nequi', daviplata: 'Daviplata', bancolombia: 'Bancolombia', contraentrega: 'Contraentrega' }[selectedPayMethod] || selectedPayMethod;
  const ciudadEnvio = selectedCity ? `${selectedCity.name}, ${selectedCity.dept}` : 'Buenaventura, Valle del Cauca';
  const totalPrendas = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping   = calcularEnvio(selectedCity, totalPrendas);
  const total      = subtotal + shipping;
  const order      = 'KK-' + Date.now().toString().slice(-6);

  const productosJson    = JSON.stringify(cart.map(i => ({ id: i.productId, name: i.name, price: i.price, size: i.size, qty: i.qty })));
  const productosResumen = cart.map(i => `${i.name} T:${i.size} x${i.qty}`).join('\n');

  // ── 2. Subir comprobante ──
  let comprobanteUrl = null;
  if (uploadedFile) {
    showOrderLoading('Subiendo comprobante...');
    try {
      const ext      = uploadedFile.name.split('.').pop().toLowerCase();
      const fileName = `comprobantes/${Date.now()}_${order}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('comprobantes')
        .upload(fileName, uploadedFile, { cacheControl: '3600', upsert: false });

      if (upErr) {
        hideOrderLoading();
        alert('Error al subir el comprobante: ' + upErr.message);
        return;
      }
      const { data: urlData } = supabase.storage.from('comprobantes').getPublicUrl(fileName);
      comprobanteUrl = urlData.publicUrl;
      uploadedURL    = comprobanteUrl;
    } catch (err) {
      console.error('Error inesperado subiendo comprobante:', err);
    }
  }

  // ── 3. Descontar stock ──
  showOrderLoading('Guardando tu pedido...');
  for (const item of cart) {
    await descontarStockSupabase(item.productId, item.qty);
  }

  // ── 4. Guardar pedido en Supabase ──
  const { error: orderError } = await supabase.from('orders').insert({
    order_id:            order,
    cliente:             `${nombre} ${apellido}`,
    celular:             celular,
    email:               email,
    tipo_doc:            tipoDoc,
    num_doc:             numDoc,
    tipo_factura:        tipoFact,
    ciudad:              ciudadEnvio,
    barrio:              barrio,
    direccion:           direccion,
    direccion_adicional: adicional,
    recibe:              recibe,
    metodo_pago:         metPago,
    referencia_pago:     '',
    comprobante_url:     comprobanteUrl,
    subtotal:            subtotal,
    costo_envio:         shipping,
    shipping_items:      totalPrendas,   // ← nueva columna
    total:               total,
    estado:              'pendiente',
    productos_json:      productosJson,
    productos_resumen:   productosResumen,
  });

  hideOrderLoading();

  if (orderError) {
    console.error('Error guardando pedido:', orderError);
    alert('Error al guardar el pedido. Revisa tu conexión e intenta de nuevo.\n\nDetalle: ' + orderError.message);
    return;
  }

  // ── 5. Sincronizar stock local y limpiar carrito ──
  await syncStockFromSupabase();
  const prodsCopy = cart.map(i => ({ ...i }));
  cart = [];
  clearCartLS();
  updateCart();
  resetUploader();

  // ── 6. Pantalla de éxito ──
  mostrarPantallaExito({
    order, nombre, apellido, ciudadEnvio, barrio, direccion,
    days:    selectedCity?.days    || '1-2 días',
    carrier: selectedCity?.carrier || 'Interrapidísimo',
    metPago, subtotal, shipping, total, prodsCopy
  });
}

/* ══════════════════════════════════════════════════════════════
   PANTALLA DE ÉXITO
══════════════════════════════════════════════════════════════ */

/**
 * Reemplaza el modal de checkout con la pantalla de confirmación.
 * Muestra resumen completo: productos, envío, método de pago.
 */
function mostrarPantallaExito(data) {
  const modal = document.getElementById('checkoutModal');
  modal.innerHTML = `
    <div class="co-success-wrap">
      <div class="co-suc-head">
        <div class="co-suc-check"><i class="bi bi-check-lg"></i></div>
        <div>
          <h2>¡Pedido Registrado!</h2>
          <p>Tu pedido fue recibido. Te confirmaremos vía WhatsApp en breve.</p>
        </div>
      </div>
      <div class="co-suc-order">
        <i class="bi bi-receipt"></i>
        <span>Número de pedido:</span>
        <strong>${data.order}</strong>
      </div>
      <div class="co-suc-body">
        <div class="co-suc-col">
          <div class="co-suc-sec-title"><i class="bi bi-bag-fill"></i> Tus productos</div>
          ${data.prodsCopy.map(p => `
            <div class="co-suc-prod">
              <img src="${p.image}" alt="${p.name}">
              <div class="co-suc-prod-info">
                <span class="co-suc-prod-name">${p.name}</span>
                <span class="co-suc-prod-det">Talla ${p.size} · x${p.qty}</span>
              </div>
              <span class="co-suc-prod-price">$${(p.price * p.qty).toLocaleString('es-CO')}</span>
            </div>`).join('')}
          <div class="co-suc-totals">
            <div class="co-suc-trow"><span>Subtotal</span><span>$${data.subtotal.toLocaleString('es-CO')}</span></div>
            <div class="co-suc-trow">
              <span>Envío (${data.prodsCopy.reduce((s,p)=>s+p.qty,0)} prenda${data.prodsCopy.reduce((s,p)=>s+p.qty,0)>1?'s':''})</span>
              <span style="color:${data.shipping === 0 ? '#25D366' : '#fbbf24'}">${data.shipping === 0 ? 'GRATIS' : '$' + data.shipping.toLocaleString('es-CO')}</span>
            </div>
            <div class="co-suc-trow co-suc-total"><span>TOTAL</span><span>$${data.total.toLocaleString('es-CO')} COP</span></div>
          </div>
        </div>
        <div class="co-suc-col">
          <div class="co-suc-sec-title"><i class="bi bi-person-fill"></i> Cliente</div>
          <div class="co-suc-info"><i class="bi bi-person"></i><span>${data.nombre} ${data.apellido}</span></div>
          <div class="co-suc-sec-title" style="margin-top:1rem"><i class="bi bi-truck"></i> Envío</div>
          <div class="co-suc-info"><i class="bi bi-geo-alt-fill"></i><span>${data.ciudadEnvio}</span></div>
          <div class="co-suc-info"><i class="bi bi-house-fill"></i><span>${data.barrio} · ${data.direccion}</span></div>
          <div class="co-suc-info"><i class="bi bi-clock-fill"></i><span>${data.days}</span></div>
          <div class="co-suc-info"><i class="bi bi-box-seam-fill"></i><span>${data.carrier}</span></div>
          <div class="co-suc-sec-title" style="margin-top:1rem"><i class="bi bi-credit-card-fill"></i> Pago</div>
          <div class="co-suc-info"><i class="bi bi-wallet2"></i><span>${data.metPago}</span></div>
          ${uploadedURL ? `<div class="co-suc-info" style="color:#25D366"><i class="bi bi-paperclip"></i><span>Comprobante adjunto ✓</span></div>` : ''}
          <div class="co-suc-wa">
            <i class="bi bi-whatsapp"></i>
            <div>
              <strong>Confirmación por WhatsApp</strong>
              <p>Te enviaremos la confirmación al número registrado en breve.</p>
            </div>
          </div>
        </div>
      </div>
      <button class="co-suc-close" onclick="closeCheckout(); location.reload();">
        <i class="bi bi-arrow-left"></i> Volver a la tienda
      </button>
    </div>`;
}

/* ══════════════════════════════════════════════════════════════
   UI — MENÚ, CURSOR, SCROLL
══════════════════════════════════════════════════════════════ */

/** Abre / cierra el menú hamburguesa en móvil */
function toggleMenu() {
  document.getElementById('hamburger').classList.toggle('open');
  document.getElementById('navLinks').classList.toggle('open');
  document.body.style.overflow =
    document.getElementById('navLinks').classList.contains('open') ? 'hidden' : 'auto';
}

/** Cierra el menú hamburguesa */
function closeMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('navLinks').classList.remove('open');
  document.body.style.overflow = 'auto';
}

/** Scroll suave al top de la página */
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// Cursor personalizado (solo en dispositivos con mouse)
const cursor = document.querySelector('.custom-cursor');
if (cursor) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, .product-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// Header scrolled + scroll-top button + parallax
window.addEventListener('scroll', () => {
  const h = document.querySelector('header');
  const s = document.querySelector('.scroll-top');
  const p = document.querySelector('.parallax-bg');
  if (h) h.classList.toggle('scrolled', window.scrollY > 80);
  if (s) s.classList.toggle('visible', window.scrollY > 200);
  if (p) p.style.transform = `translateY(${window.pageYOffset * 0.4}px)`;
});

// Smooth scroll para links de ancla
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Esc cierra modales
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeProductModal(); closeCheckout(); }
});

// Clic fuera del modal lo cierra
document.getElementById('productModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeProductModal();
});
document.getElementById('checkoutOverlay')?.addEventListener('click', function(e) {
  if (e.target === this) closeCheckout();
});

/* ══════════════════════════════════════════════════════════════
   INICIALIZAR
══════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', async () => {
  // Restaurar carrito desde localStorage ANTES de cargar productos
  loadCartLS();
  await cargarProductosDesdeSupabase();
  // Re-renderizar carrito con los productos ya cargados
  updateCart();
});