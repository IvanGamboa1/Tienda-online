/* ══════════════════════════════════════════════════════════════
   SUPABASE CONFIG
══════════════════════════════════════════════════════════════ */
const SUPABASE_URL = "https://oasuoihjkoaaxajwjleo.supabase.co";
const SUPABASE_KEY = "sb_publishable_f_LGWDnVb0Gu7oM4NV2imA_iuNmon1I";
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ══════════════════════════════════════════════════════════════
   CONFIGURACIÓN GENERAL
══════════════════════════════════════════════════════════════ */
const WHATSAPP_NUMBER = '573128462280';
const STOCK_MAX = 5;

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
// Imágenes SVG para demo (se sobreescriben con los datos de Supabase)
const SVG_BLACK = `data:image/svg+xml;utf8,<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="500" fill="%230d0d0d"/><text x="300" y="220" font-family="sans-serif" font-size="90" font-weight="900" fill="rgba(255,255,255,0.06)" text-anchor="middle">K1KO</text><text x="300" y="290" font-family="sans-serif" font-size="22" fill="rgba(251,191,36,0.35)" text-anchor="middle" letter-spacing="8">SAND BLACK</text></svg>`;
const SVG_WHITE = `data:image/svg+xml;utf8,<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="500" fill="%23efefef"/><text x="300" y="220" font-family="sans-serif" font-size="90" font-weight="900" fill="rgba(0,0,0,0.06)" text-anchor="middle">K1KO</text><text x="300" y="290" font-family="sans-serif" font-size="22" fill="rgba(220,38,38,0.3)" text-anchor="middle" letter-spacing="8">SAND WHITE</text></svg>`;

const products = {
  black: {
    id: 'black', name: 'Sand K1KO Black', price: 89900,
    image: 'img/black.jpeg', previewSrc: SVG_BLACK,
    itemNumber: 'Item: 00001',
    description: 'Camiseta oversized premium con diseño gráfico exclusivo. Fabricada en 100% algodón premium. El modelo mide 1.83m y usa talla M.',
    stock: STOCK_MAX
  },
  white: {
    id: 'white', name: 'Sand K1KO White', price: 89900,
    image: 'img/white.jpeg', previewSrc: SVG_WHITE,
    itemNumber: 'Item: 00002',
    description: 'Camiseta oversized en blanco puro con estampado de alto contraste. Fabricada en 100% algodón premium. El modelo mide 1.83m y usa talla M.',
    stock: STOCK_MAX
  }
};

let currentProduct    = null;
let currentProductKey = null;
let cart              = [];
let currentStep       = 1;
let selectedPayMethod = '';
let modalQty          = 1;
let selectedCity      = null;   // ← ciudad seleccionada en checkout

/* ══════════════════════════════════════════════════════════════
   CARGAR PRODUCTOS DESDE SUPABASE
══════════════════════════════════════════════════════════════ */
async function cargarProductosDesdeSupabase() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) { console.error('Error cargando productos:', error); return; }

  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  for (let key in products) delete products[key];

  data.forEach(prod => {
    products[prod.id] = {
      id: prod.id, name: prod.name, price: prod.price,
      image: prod.image, description: '',
      itemNumber: `Item: ${prod.id}`, stock: prod.stock
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

// Realtime: actualizar stock al detectar cambios
supabase.channel('stock-changes')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, () => {
    syncStockFromSupabase();
  })
  .subscribe();

/* ══════════════════════════════════════════════════════════════
   STOCK
══════════════════════════════════════════════════════════════ */
function qtyInCart(pid) {
  return cart.filter(i => i.productId === pid).reduce((s,i) => s + i.qty, 0);
}
function availableStock(pid) {
  return (products[pid]?.stock ?? 0) - qtyInCart(pid);
}

async function descontarStockSupabase(productId, cantidad) {
  const { data, error } = await supabase.from('products').select('stock').eq('id', productId).single();
  if (error) { console.error('Error obteniendo stock:', error); return; }
  const nuevoStock = Math.max(data.stock - cantidad, 0);
  const { error: upErr } = await supabase.from('products').update({ stock: nuevoStock }).eq('id', productId);
  if (upErr) console.error('Error actualizando stock:', upErr);
  else       console.log(`Stock actualizado ${productId}: ${nuevoStock}`);
}

async function syncStockFromSupabase() {
  const { data, error } = await supabase.from('products').select('id, stock');
  if (error) return;
  data.forEach(p => { if (products[p.id]) products[p.id].stock = p.stock; });
  updateProductCards();
}

/* ══════════════════════════════════════════════════════════════
   MODAL PRODUCTO
══════════════════════════════════════════════════════════════ */
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
  img.src = currentProduct.image || currentProduct.previewSrc;
  img.alt = currentProduct.name;

  document.querySelectorAll('.modal-size-btn').forEach((b,i) => b.classList.toggle('selected', i===1));
  renderModalQty();
  document.getElementById('productModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
  document.body.style.overflow = 'auto';
}
function selectModalSize(btn) {
  document.querySelectorAll('.modal-size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}
function renderModalQty() {
  const avail    = availableStock(currentProductKey);
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
  const sm    = avail === 1 ? '⚠️ ¡Última unidad!' : isLow ? `⚠️ ¡Solo ${avail} disponibles!` : `${avail} de ${STOCK_MAX} unidades disponibles`;
  qtyBlock.innerHTML = `
    <div style="padding:.55rem .9rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);margin-bottom:.9rem;">
      <span style="font-size:.78rem;color:${sc};font-weight:700;">${sm}</span>
    </div>
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;">
      <span style="font-size:.78rem;color:#a3a3a3;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Cantidad</span>
      <div style="display:flex;align-items:center;gap:.4rem;">
        <button onclick="changeModalQty(-1)" ${modalQty<=1?'disabled':''}
          style="width:38px;height:38px;border:2px solid ${modalQty<=1?'rgba(255,255,255,.08)':'rgba(255,255,255,.25)'};background:transparent;color:${modalQty<=1?'rgba(255,255,255,.2)':'#fff'};font-size:1.3rem;font-weight:700;cursor:${modalQty<=1?'not-allowed':'pointer'};display:flex;align-items:center;justify-content:center;">−</button>
        <div style="width:44px;height:38px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.15);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;">${modalQty}</div>
        <button onclick="changeModalQty(1)" ${modalQty>=avail?'disabled':''}
          style="width:38px;height:38px;border:2px solid ${modalQty>=avail?'rgba(255,255,255,.08)':'rgba(255,255,255,.25)'};background:transparent;color:${modalQty>=avail?'rgba(255,255,255,.2)':'#fff'};font-size:1.3rem;font-weight:700;cursor:${modalQty>=avail?'not-allowed':'pointer'};display:flex;align-items:center;justify-content:center;">+</button>
      </div>
      <span style="font-size:.72rem;color:#a3a3a3;">máx. ${avail}</span>
    </div>`;
  const btn = document.getElementById('modal-add-cart-btn');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-cart-plus-fill"></i> AGREGAR${modalQty>1?' '+modalQty+' uds —':''} $${(currentProduct.price*modalQty).toLocaleString('es-CO')} COP`;
  }
}
function changeModalQty(d) {
  const avail = availableStock(currentProductKey);
  modalQty = Math.min(Math.max(modalQty + d, 1), avail);
  renderModalQty();
}
function addToCartFromModal() {
  if (!currentProduct) return;
  const key   = currentProductKey;
  const avail = availableStock(key);
  if (avail <= 0 || modalQty < 1) return;
  const size = document.querySelector('.modal-size-btn.selected')?.textContent || 'M';
  const existing = cart.find(i => i.productId === key && i.size === size);
  if (existing) existing.qty = Math.min(existing.qty + modalQty, STOCK_MAX);
  else cart.push({ id: Date.now(), productId: key, name: currentProduct.name, price: currentProduct.price, size, qty: modalQty, image: currentProduct.image || currentProduct.previewSrc });
  updateCart();
  closeProductModal();
  setTimeout(toggleCart, 300);
}

/* ══════════════════════════════════════════════════════════════
   CARRITO
══════════════════════════════════════════════════════════════ */
function toggleCart() { document.getElementById('cartSidebar').classList.toggle('active'); }
function removeFromCart(id) { cart = cart.filter(i => i.id !== id); updateCart(); }
function cartChangeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const maxAllowed = Math.min(STOCK_MAX, availableStock(item.productId) + item.qty);
  const newQty = item.qty + delta;
  if (newQty < 1) { removeFromCart(id); return; }
  if (newQty > maxAllowed) return;
  item.qty = newQty;
  updateCart();
}
function updateCart() {
  const items    = document.getElementById('cartItems');
  const footer   = document.getElementById('cartFooter');
  const totalQty = cart.reduce((s,i) => s + i.qty, 0);
  document.querySelector('.cart-count').textContent = totalQty;
  if (cart.length === 0) {
    items.innerHTML = `<div class="cart-empty"><i class="bi bi-bag-x"></i><p>Tu carrito está vacío</p></div>`;
    footer.style.display = 'none';
    updateProductCards();
    return;
  }
  items.innerHTML = cart.map(item => {
    const maxA = Math.min(STOCK_MAX, availableStock(item.productId) + item.qty);
    const atMax = item.qty >= maxA;
    return `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">Talla: <strong>${item.size}</strong></div>
        <div class="cart-item-price">$${(item.price*item.qty).toLocaleString('es-CO')} COP</div>
        <div class="cart-qty-row">
          <button class="cqb" onclick="cartChangeQty(${item.id},-1)" ${item.qty<=1?'disabled':''}>−</button>
          <div class="cqn">${item.qty}</div>
          <button class="cqb" onclick="cartChangeQty(${item.id},1)" ${atMax?'disabled':''}>+</button>
          ${atMax?`<span class="cqmax">máx. ${STOCK_MAX}</span>`:''}
        </div>
      </div>
      <i class="bi bi-trash remove-item" onclick="removeFromCart(${item.id})"></i>
    </div>`;
  }).join('');
  document.getElementById('cartTotal').textContent = `$${cart.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString('es-CO')} COP`;
  footer.style.display = 'block';
  updateProductCards();
}
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
        ov.className = 'oos-overlay'; ov.textContent = 'AGOTADO';
        card.querySelector('.product-image-container').appendChild(ov);
      }
    } else {
      card.classList.remove('out-of-stock');
      card.setAttribute('onclick', `openProductModal('${key}')`);
      const ov = card.querySelector('.oos-overlay');
      if (ov) ov.remove();
      if (avail <= 2) { badge.textContent = `¡Solo ${avail} disponible${avail>1?'s':''}!`; badge.className = 'product-badge badge-low'; }
      else            { badge.textContent = 'Nuevo'; badge.className = 'product-badge'; }
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   CHECKOUT — APERTURA / CIERRE
══════════════════════════════════════════════════════════════ */
function openCheckout() {
  if (cart.length === 0) return;
  selectedCity = null;
  fillSummary();
  document.getElementById('checkoutOverlay').classList.add('active');
  document.getElementById('cartSidebar').classList.remove('active');
  document.body.style.overflow = 'hidden';
  // Reset city picker
  const csi = document.getElementById('co-city-search');
  if (csi) csi.value = '';
  const csb = document.getElementById('co-city-box');
  if (csb) { csb.style.display = 'none'; }
  const cdd = document.getElementById('co-city-dropdown');
  if (cdd) cdd.style.display = 'none';
  const cerr = document.getElementById('err-ciudad');
  if (cerr) cerr.textContent = '';
  goStep(1, true);
}
function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('active');
  document.body.style.overflow = 'auto';
}
function fillSummary() {
  const sub = cart.reduce((s,i) => s+i.price*i.qty, 0);
  const qty = cart.reduce((s,i) => s+i.qty, 0);
  const shipping = selectedCity ? selectedCity.cost : 0;
  document.getElementById('co-item-count').textContent  = qty + ' producto' + (qty>1?'s':'');
  document.getElementById('co-subtotal').textContent    = '$' + sub.toLocaleString('es-CO');
  document.getElementById('co-total-final').textContent = '$' + (sub+shipping).toLocaleString('es-CO');
  const envioEl = document.getElementById('co-envio-val');
  if (envioEl) {
    envioEl.textContent = shipping === 0 ? 'Gratis' : '$'+shipping.toLocaleString('es-CO');
    envioEl.className   = shipping === 0 ? 'co-green' : '';
    envioEl.style.color = shipping === 0 ? '' : '#fbbf24';
  }
  document.getElementById('co-summary-items').innerHTML = cart.map(item => `
    <div class="co-summary-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="co-summary-item-info">
        <div class="co-summary-item-name">${item.name}</div>
        <div class="co-summary-item-size">Talla: ${item.size} · Cant: ${item.qty}</div>
      </div>
      <div class="co-summary-item-price">$${(item.price*item.qty).toLocaleString('es-CO')}</div>
    </div>`).join('');
}

/* ══════════════════════════════════════════════════════════════
   CHECKOUT — PASOS / VALIDACIÓN
══════════════════════════════════════════════════════════════ */
function goStep(step, force) {
  if (!force && step > currentStep && !validateStep(currentStep)) return;
  currentStep = step;
  document.querySelectorAll('.co-panel').forEach((p,i) => p.classList.toggle('active', i+1===step));
  document.querySelectorAll('.co-step').forEach((d,i) => {
    d.classList.remove('active','done');
    if (i+1===step)    d.classList.add('active');
    else if (i+1<step) d.classList.add('done');
  });
  document.querySelectorAll('.co-step-line').forEach((l,i) => l.classList.toggle('done', i+1<step));
  document.getElementById('checkoutModal').scrollIntoView({behavior:'smooth',block:'start'});
}
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
    const eok = check('co-email','err-email','Ingresa tu correo.');
    if (eok && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('co-email').value.trim())) {
      document.getElementById('co-email').classList.add('invalid');
      document.getElementById('err-email').textContent = 'Correo inválido.'; ok = false;
    }
    check('co-nombre','err-nombre'); check('co-apellido','err-apellido');
    const cok = check('co-celular','err-celular','Ingresa tu celular.');
    if (cok && !/^\d{10}$/.test(document.getElementById('co-celular').value.trim())) {
      document.getElementById('co-celular').classList.add('invalid');
      document.getElementById('err-celular').textContent = 'Debe tener 10 dígitos.'; ok = false;
    }
    check('co-tipoDoc','err-tipoDoc','Selecciona tipo.');
    check('co-numDoc','err-numDoc','Ingresa número.');
    check('co-tipoFactura','err-tipoFactura','Selecciona factura.');
  }
  if (step === 2) {
    // Validar ciudad
    if (!selectedCity) {
      const e = document.getElementById('err-ciudad');
      if (e) e.textContent = 'Selecciona una ciudad de destino.';
      ok = false;
    } else {
      const e = document.getElementById('err-ciudad');
      if (e) e.textContent = '';
    }
    check('co-municipio','err-municipio','Ingresa barrio.');
    check('co-direccion','err-direccion','Ingresa dirección.');
    check('co-recibe','err-recibe','Ingresa nombre.');
  }
  if (step === 3 && ['nequi','daviplata','bancolombia'].includes(selectedPayMethod))
    check('co-referencia','err-referencia','Ingresa número de referencia.');
  if (step === 3 && !selectedPayMethod) ok = false;
  return ok;
}
function selectPay(label, method) {
  selectedPayMethod = method;
  document.querySelectorAll('.co-pay-opt').forEach(l => l.classList.remove('selected'));
  label.classList.add('selected');
  const rf = document.getElementById('refFields');
  const rb = document.getElementById('refBanner');
  const ai = document.getElementById('altInfo');
  rf.style.display = ai.style.display = 'none';
  rb.className = 'co-ref-banner'; rb.innerHTML = '';
  if (method==='nequi')        { rf.style.display='block'; rb.classList.add('nequi');       rb.innerHTML=`<span>📱</span><span>Transfiere al <strong>3128462280</strong> por Nequi y pega el comprobante.</span>`; }
  else if (method==='daviplata')    { rf.style.display='block'; rb.classList.add('daviplata');   rb.innerHTML=`<span>📱</span><span>Transfiere al <strong>3128462280</strong> por Daviplata y pega el comprobante.</span>`; }
  else if (method==='bancolombia')  { rf.style.display='block'; rb.classList.add('bancolombia'); rb.innerHTML=`<span>🏦</span><span>Transfiere a cuenta <strong>XXX-XXXXXXXX</strong> Bancolombia y pega la referencia.</span>`; }
  else if (method==='contraentrega'){ ai.style.display='block'; document.getElementById('altInfoText').textContent='Pagas en efectivo al recibir. Domiciliario en 1 día hábil. Sin costo adicional.'; }
}

/* ══════════════════════════════════════════════════════════════
   SELECTOR DE CIUDADES
══════════════════════════════════════════════════════════════ */
function openCityDropdown() {
  const dd = document.getElementById('co-city-dropdown');
  if (dd) dd.style.display = 'block';
  filterCities(document.getElementById('co-city-search')?.value || '');
}
function filterCities(term) {
  const dd   = document.getElementById('co-city-dropdown');
  const list = document.getElementById('co-city-list');
  if (!dd || !list) return;
  dd.style.display = 'block';
  const t = term.toLowerCase().trim();
  const filtered = t.length < 1
    ? CIUDADES
    : CIUDADES.filter(c => c.name.toLowerCase().includes(t) || c.dept.toLowerCase().includes(t));
  if (!filtered.length) {
    list.innerHTML = `<div class="co-city-empty"><i class="bi bi-search"></i> Sin resultados para "${term}"</div>`;
    return;
  }
  // Agrupar por departamento
  const byDept = {};
  filtered.forEach(c => { if (!byDept[c.dept]) byDept[c.dept] = []; byDept[c.dept].push(c); });
  list.innerHTML = Object.entries(byDept).map(([dept, cities]) => `
    <div class="co-city-dept">📍 ${dept}</div>
    ${cities.map(c => {
      const tagTxt = c.zone==='free' ? 'Gratis' : c.zone==='near' ? 'Cercano' : 'Nacional';
      const tagCls = c.zone==='free' ? 'co-city-tag-free' : c.zone==='near' ? 'co-city-tag-near' : 'co-city-tag-std';
      return `<div class="co-city-opt" onclick="selectCity(${JSON.stringify(c).replace(/"/g,'&quot;')})">
        <div>
          <div class="co-city-name">${c.name}</div>
          <div class="co-city-sub">${c.dept}</div>
        </div>
        <span class="co-city-tag ${tagCls}">${tagTxt}</span>
      </div>`;
    }).join('')}
  `).join('');
}
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
  // Mostrar caja de info
  const box = document.getElementById('co-city-box');
  if (box) {
    box.style.display = 'block';
    document.getElementById('co-city-box-name').textContent = city.name;
    document.getElementById('co-city-box-dept').textContent = city.dept;
    document.getElementById('co-city-box-time').textContent = city.days;
    document.getElementById('co-city-box-type').textContent = city.name === 'San Andrés' ? 'Aéreo' : 'Terrestre · Carretera';
    const costEl = document.getElementById('co-city-box-cost');
    costEl.textContent = city.cost === 0 ? '¡GRATIS!' : '$'+city.cost.toLocaleString('es-CO')+' COP';
    costEl.style.color = city.cost === 0 ? '#25D366' : '#fbbf24';
    document.getElementById('co-city-box-carrier').textContent = city.carrier;
  }
  fillSummary();
}
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

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('co-city-wrap');
  const dd   = document.getElementById('co-city-dropdown');
  if (wrap && dd && !wrap.contains(e.target)) dd.style.display = 'none';
});

/* ══════════════════════════════════════════════════════════════
   CONFIRMAR PEDIDO — GUARDA EN SUPABASE, SIN WHATSAPP AUTOMÁTICO
══════════════════════════════════════════════════════════════ */
async function confirmOrder() {
  if (!validateStep(3)) return;

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
  const metPago   = {nequi:'Nequi',daviplata:'Daviplata',bancolombia:'Bancolombia',contraentrega:'Contraentrega'}[selectedPayMethod] || selectedPayMethod;
  const ref       = ['nequi','daviplata','bancolombia'].includes(selectedPayMethod) ? g('co-referencia') : '';
  const ciudadEnvio = selectedCity ? `${selectedCity.name}, ${selectedCity.dept}` : 'Buenaventura, Valle del Cauca';
  const subtotal  = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const shipping  = selectedCity ? selectedCity.cost : 0;
  const total     = subtotal + shipping;
  const order     = 'KK-' + Date.now().toString().slice(-6);

  const productosJson    = JSON.stringify(cart.map(i => ({id:i.productId, name:i.name, price:i.price, size:i.size, qty:i.qty})));
  const productosResumen = cart.map(i => `${i.name} T:${i.size} x${i.qty}`).join('\n');

  // Mostrar loading en el botón
  const btnConfirm = document.querySelector('.co-btn-confirm');
  if (btnConfirm) { btnConfirm.disabled = true; btnConfirm.innerHTML = '<i class="bi bi-arrow-repeat"></i> Guardando...'; }

  // 1. Descontar stock en Supabase
  for (const item of cart) {
    await descontarStockSupabase(item.productId, item.qty);
  }

  // 2. Guardar pedido en Supabase
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
    referencia_pago:     ref,
    subtotal:            subtotal,
    costo_envio:         shipping,
    total:               total,
    estado:              'pendiente',
    productos_json:      productosJson,
    productos_resumen:   productosResumen,
  });

  if (btnConfirm) { btnConfirm.disabled = false; btnConfirm.innerHTML = '<i class="bi bi-check-circle-fill"></i> Confirmar Pedido'; }

  if (orderError) {
    console.error('Error guardando pedido:', orderError);
    alert('Error al guardar el pedido. Revisa tu conexión e intenta de nuevo.\n\nDetalle: ' + orderError.message);
    return;
  }

  // 3. Sincronizar stock local
  await syncStockFromSupabase();

  // 4. Guardar datos para pantalla de éxito
  const prodsCopy = cart.map(i => ({...i}));

  // 5. Limpiar carrito
  cart = [];
  updateCart();

  // 6. Mostrar pantalla de éxito
  mostrarPantallaExito({
    order, nombre, apellido, ciudadEnvio, barrio, direccion,
    days: selectedCity?.days || '1-2 días',
    carrier: selectedCity?.carrier || 'Interrapidísimo',
    metPago, subtotal, shipping, total, prodsCopy
  });
}

/* ══════════════════════════════════════════════════════════════
   PANTALLA DE ÉXITO (reemplaza el checkout)
══════════════════════════════════════════════════════════════ */
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
              <span class="co-suc-prod-price">$${(p.price*p.qty).toLocaleString('es-CO')}</span>
            </div>`).join('')}
          <div class="co-suc-totals">
            <div class="co-suc-trow"><span>Subtotal</span><span>$${data.subtotal.toLocaleString('es-CO')}</span></div>
            <div class="co-suc-trow"><span>Envío</span><span style="color:${data.shipping===0?'#25D366':'#fbbf24'}">${data.shipping===0?'GRATIS':'$'+data.shipping.toLocaleString('es-CO')}</span></div>
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
function toggleMenu() {
  document.getElementById('hamburger').classList.toggle('open');
  document.getElementById('navLinks').classList.toggle('open');
  document.body.style.overflow = document.getElementById('navLinks').classList.contains('open') ? 'hidden' : 'auto';
}
function closeMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('navLinks').classList.remove('open');
  document.body.style.overflow = 'auto';
}
function scrollToTop() { window.scrollTo({top:0, behavior:'smooth'}); }

const cursor = document.querySelector('.custom-cursor');
if (cursor) {
  document.addEventListener('mousemove', e => { cursor.style.left = e.clientX+'px'; cursor.style.top = e.clientY+'px'; });
  document.querySelectorAll('a,button,.product-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}
window.addEventListener('scroll', () => {
  const h = document.querySelector('header');
  const s = document.querySelector('.scroll-top');
  const p = document.querySelector('.parallax-bg');
  if (h) h.classList.toggle('scrolled', window.scrollY > 80);
  if (s) s.classList.toggle('visible', window.scrollY > 200);
  if (p) p.style.transform = `translateY(${window.pageYOffset * 0.4}px)`;
});
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({behavior:'smooth', block:'start'});
  });
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeProductModal(); closeCheckout(); } });
document.getElementById('productModal')?.addEventListener('click', function(e) { if (e.target === this) closeProductModal(); });
document.getElementById('checkoutOverlay')?.addEventListener('click', function(e) { if (e.target === this) closeCheckout(); });

/* ══════════════════════════════════════════════════════════════
   INICIALIZAR
══════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', async () => {
  await cargarProductosDesdeSupabase();
});