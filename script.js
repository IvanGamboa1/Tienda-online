// ══════════════════════════════════════════
//  CONFIGURACIÓN  (doc 4 = fuente principal)
// ══════════════════════════════════════════
const WHATSAPP_NUMBER = '573128462280';
const STOCK_MAX = 5;

// Imágenes SVG inline para demo (reemplaza con img/black.jpeg y img/white.jpeg en producción)
const SVG_BLACK = `data:image/svg+xml;utf8,<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="500" fill="%230d0d0d"/><text x="300" y="220" font-family="sans-serif" font-size="90" font-weight="900" fill="rgba(255,255,255,0.06)" text-anchor="middle">K1KO</text><text x="300" y="290" font-family="sans-serif" font-size="22" fill="rgba(251,191,36,0.35)" text-anchor="middle" letter-spacing="8">SAND BLACK</text><circle cx="300" cy="250" r="180" fill="none" stroke="rgba(220,38,38,0.1)" stroke-width="1"/></svg>`;
const SVG_WHITE = `data:image/svg+xml;utf8,<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="500" fill="%23efefef"/><text x="300" y="220" font-family="sans-serif" font-size="90" font-weight="900" fill="rgba(0,0,0,0.06)" text-anchor="middle">K1KO</text><text x="300" y="290" font-family="sans-serif" font-size="22" fill="rgba(220,38,38,0.3)" text-anchor="middle" letter-spacing="8">SAND WHITE</text><circle cx="300" cy="250" r="180" fill="none" stroke="rgba(0,0,0,0.07)" stroke-width="1"/></svg>`;

const products = {
    black: {
        id: 'black',
        name: 'Sand K1KO Black',
        price: 89900,
        image: 'img/black.jpeg',   // ruta real en producción
        previewSrc: SVG_BLACK,      // solo para esta demo
        itemNumber: 'Item: 00001',
        description: 'Camiseta oversized premium con diseño gráfico exclusivo. Fabricada en 100% algodón premium. El modelo mide 1.83m y usa talla M.',
        stock: STOCK_MAX
    },
    white: {
        id: 'white',
        name: 'Sand K1KO White',
        price: 89900,
        image: 'img/white.jpeg',
        previewSrc: SVG_WHITE,
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

// ══════════════════════════════════════════
//  STOCK
// ══════════════════════════════════════════
function qtyInCart(pid) {
    return cart.filter(i => i.productId === pid).reduce((s,i) => s + i.qty, 0);
}
function availableStock(pid) {
    return products[pid].stock - qtyInCart(pid);
}

// ══════════════════════════════════════════
//  MODAL PRODUCTO
// ══════════════════════════════════════════
function openProductModal(key) {
    if (availableStock(key) <= 0) return;
    currentProductKey = key;
    currentProduct    = products[key];
    modalQty          = 1;

    document.getElementById('modalTitle').textContent       = currentProduct.name;
    document.getElementById('modalPrice').textContent       = `$${currentProduct.price.toLocaleString('es-CO')} COP`;
    document.getElementById('modalItemNumber').textContent  = currentProduct.itemNumber;
    document.getElementById('modalDescription').textContent = currentProduct.description;

    // Mostrar imagen real del producto en el modal
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

// ── Qty en modal ──
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

    const isLow  = avail <= 2;
    const sc     = avail === 1 ? '#f87171' : isLow ? '#fbbf24' : '#4ade80';
    const sm     = avail === 1 ? '⚠️ ¡Última unidad!' : isLow ? `⚠️ ¡Solo ${avail} disponibles!` : `${avail} de ${STOCK_MAX} unidades disponibles`;
    const canDec = modalQty > 1;
    const canInc = modalQty < avail;

    qtyBlock.innerHTML = `
        <div style="padding:.55rem .9rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);margin-bottom:.9rem;display:flex;align-items:center;gap:.5rem;">
            <span style="font-size:.78rem;color:${sc};font-weight:700;">${sm}</span>
        </div>
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:.5rem;">
            <span style="font-size:.78rem;color:#a3a3a3;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Cantidad</span>
            <div style="display:flex;align-items:center;gap:.4rem;">
                <button onclick="changeModalQty(-1)" ${canDec?'':'disabled'}
                    style="width:38px;height:38px;border:2px solid ${canDec?'rgba(255,255,255,.25)':'rgba(255,255,255,.08)'};
                    background:transparent;color:${canDec?'#fff':'rgba(255,255,255,.2)'};font-size:1.3rem;font-weight:700;
                    cursor:${canDec?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center;
                    font-family:'Montserrat',sans-serif;transition:all .2s;"
                    onmouseover="if(!this.disabled){this.style.borderColor='#fbbf24';this.style.color='#fbbf24';}"
                    onmouseout="if(!this.disabled){this.style.borderColor='rgba(255,255,255,.25)';this.style.color='#fff';}">−</button>
                <div style="width:44px;height:38px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.15);
                    color:#fff;display:flex;align-items:center;justify-content:center;
                    font-family:'Montserrat',sans-serif;font-weight:800;font-size:1.1rem;">${modalQty}</div>
                <button onclick="changeModalQty(1)" ${canInc?'':'disabled'}
                    style="width:38px;height:38px;border:2px solid ${canInc?'rgba(255,255,255,.25)':'rgba(255,255,255,.08)'};
                    background:transparent;color:${canInc?'#fff':'rgba(255,255,255,.2)'};font-size:1.3rem;font-weight:700;
                    cursor:${canInc?'pointer':'not-allowed'};display:flex;align-items:center;justify-content:center;
                    font-family:'Montserrat',sans-serif;transition:all .2s;"
                    onmouseover="if(!this.disabled){this.style.borderColor='#fbbf24';this.style.color='#fbbf24';}"
                    onmouseout="if(!this.disabled){this.style.borderColor='rgba(255,255,255,.25)';this.style.color='#fff';}">+</button>
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
    if (existing) {
        existing.qty = Math.min(existing.qty + modalQty, STOCK_MAX);
    } else {
            cart.push({ id: Date.now(), productId: key, name: currentProduct.name, price: currentProduct.price, size, qty: modalQty, image: currentProduct.image || currentProduct.previewSrc });
    }
    updateCart();
    closeProductModal();
    setTimeout(toggleCart, 300);
}

// ══════════════════════════════════════════
//  CARRITO
// ══════════════════════════════════════════
function toggleCart() { document.getElementById('cartSidebar').classList.toggle('active'); }

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

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

// ══════════════════════════════════════════
//  TARJETAS — badge y estado OOS
// ══════════════════════════════════════════
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
                ov.className   = 'oos-overlay';
                ov.textContent = 'AGOTADO';
                card.querySelector('.product-image-container').appendChild(ov);
            }
        } else {
            card.classList.remove('out-of-stock');
            card.setAttribute('onclick', `openProductModal('${key}')`);
            const ov = card.querySelector('.oos-overlay');
            if (ov) ov.remove();
            if (avail <= 2) {
                badge.textContent = `¡Solo ${avail} disponible${avail>1?'s':''}!`;
                badge.className   = 'product-badge badge-low';
            } else {
                badge.textContent = 'Nuevo';
                badge.className   = 'product-badge';
            }
        }
    });
}

// ══════════════════════════════════════════
//  CHECKOUT
// ══════════════════════════════════════════
function openCheckout() {
    if (cart.length === 0) return;
    fillSummary();
    document.getElementById('checkoutOverlay').classList.add('active');
    document.getElementById('cartSidebar').classList.remove('active');
    document.body.style.overflow = 'hidden';
    goStep(1, true);
}
function closeCheckout() {
    document.getElementById('checkoutOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function fillSummary() {
    const total    = cart.reduce((s,i) => s+i.price*i.qty, 0);
    const totalQty = cart.reduce((s,i) => s+i.qty, 0);
    document.getElementById('co-item-count').textContent  = totalQty + ' producto' + (totalQty>1?'s':'');
    document.getElementById('co-subtotal').textContent    = '$' + total.toLocaleString('es-CO');
    document.getElementById('co-total-final').textContent = '$' + total.toLocaleString('es-CO');
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
        const val = el.value.trim();
        if (!val) { el.classList.add('invalid'); document.getElementById(errId).textContent = msg||'Campo obligatorio.'; ok=false; }
        else       { el.classList.remove('invalid'); document.getElementById(errId).textContent = ''; }
        return !!val;
    }
    if (step===1) {
        const eok = check('co-email','err-email','Ingresa tu correo.');
        if (eok && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('co-email').value.trim())) {
            document.getElementById('co-email').classList.add('invalid');
            document.getElementById('err-email').textContent='Correo inválido.'; ok=false;
        }
        check('co-nombre','err-nombre'); check('co-apellido','err-apellido');
        const cok=check('co-celular','err-celular','Ingresa tu celular.');
        if (cok && !/^\d{10}$/.test(document.getElementById('co-celular').value.trim())) {
            document.getElementById('co-celular').classList.add('invalid');
            document.getElementById('err-celular').textContent='Debe tener 10 dígitos.'; ok=false;
        }
        check('co-tipoDoc','err-tipoDoc','Selecciona tipo.'); check('co-numDoc','err-numDoc','Ingresa número.'); check('co-tipoFactura','err-tipoFactura','Selecciona factura.');
    }
    if (step===2) { check('co-municipio','err-municipio','Ingresa barrio.'); check('co-direccion','err-direccion','Ingresa dirección.'); check('co-recibe','err-recibe','Ingresa nombre.'); }
    if (step===3 && ['nequi','daviplata','bancolombia'].includes(selectedPayMethod))
        check('co-referencia','err-referencia','Ingresa número de referencia.');
    if (step===3 && !selectedPayMethod) ok=false;
    return ok;
}

function selectPay(label, method) {
    selectedPayMethod = method;
    document.querySelectorAll('.co-pay-opt').forEach(l => l.classList.remove('selected'));
    label.classList.add('selected');
    const rf  = document.getElementById('refFields');
    const rb  = document.getElementById('refBanner');
    const ai  = document.getElementById('altInfo');
    rf.style.display = ai.style.display = 'none';
    rb.className = 'co-ref-banner'; rb.innerHTML = '';
    if (method==='nequi')       { rf.style.display='block'; rb.classList.add('nequi');       rb.innerHTML=`<span>📱</span><span>Transfiere al <strong>3128462280</strong> por Nequi y pega el comprobante.</span>`; }
    else if (method==='daviplata')   { rf.style.display='block'; rb.classList.add('daviplata');   rb.innerHTML=`<span>📱</span><span>Transfiere al <strong>3128462280</strong> por Daviplata y pega el comprobante.</span>`; }
    else if (method==='bancolombia') { rf.style.display='block'; rb.classList.add('bancolombia'); rb.innerHTML=`<span>🏦</span><span>Transfiere a cuenta <strong>XXX-XXXXXXXX</strong> Bancolombia y pega la referencia.</span>`; }
    else if (method==='contraentrega') { ai.style.display='block'; document.getElementById('altInfoText').textContent='Pagas en efectivo al recibir. Domiciliario en 1 día hábil. Sin costo adicional.'; }
}

function confirmOrder() {
    if (!validateStep(3)) return;
    const g  = id => document.getElementById(id).value.trim();
    const nombre=g('co-nombre'); const apellido=g('co-apellido'); const email=g('co-email');
    const celular=g('co-celular'); const tipoDoc=g('co-tipoDoc'); const numDoc=g('co-numDoc');
    const tipoFact=document.getElementById('co-tipoFactura').value==='empresa'?'Empresa / NIT':'Persona Natural';
    const munic=g('co-municipio'); const dir=g('co-direccion'); const adicional=g('co-adicional'); const recibe=g('co-recibe');
    const metPago={nequi:'Nequi',daviplata:'Daviplata',bancolombia:'Bancolombia',contraentrega:'Contraentrega'}[selectedPayMethod]||selectedPayMethod;
    const ref=['nequi','daviplata','bancolombia'].includes(selectedPayMethod)?g('co-referencia'):null;
    const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
    const fecha=new Date().toLocaleString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const order='KK-'+Date.now().toString().slice(-6);
    let msg=`*FACTURA K1KO STREETWEAR*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n*Pedido:* ${order}\n*Fecha:* ${fecha}\n\n`;
    msg+=`*DATOS DEL CLIENTE*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Nombre: ${nombre} ${apellido}\n• Celular: ${celular}\n• Email: ${email}\n• ${tipoDoc}: ${numDoc}\n• Facturar como: ${tipoFact}\n\n`;
    msg+=`*PRODUCTOS*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    cart.forEach((item,idx) => { msg+=`\n${idx+1}. *${item.name}*\n   Talla: ${item.size}\n   Cant: ${item.qty}\n   Precio: $${item.price.toLocaleString('es-CO')} COP\n   Subtotal: $${(item.price*item.qty).toLocaleString('es-CO')} COP\n`; });
    msg+=`\n*ENVÍO*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Ciudad: Buenaventura, Valle del Cauca\n• Barrio: ${munic}\n• Dirección: ${dir}\n`;
    if (adicional) msg+=`• Adicional: ${adicional}\n`;
    msg+=`• Recibe: ${recibe}\n• Método: Envío Estándar (Gratis)\n\n`;
    msg+=`*PAGO*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Método: ${metPago}\n`;
    if (ref) msg+=`• Ref/Comprobante: ${ref}\n`;
    msg+=`\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n*TOTAL: $${total.toLocaleString('es-CO')} COP*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPedido confirmado. Pronto te contactamos.\nK1KO Streetwear · Colombia`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    closeCheckout();
}

// ══════════════════════════════════════════
//  UI — menú, cursor, scroll
// ══════════════════════════════════════════
function toggleMenu() {
    document.getElementById('hamburger').classList.toggle('open');
    document.getElementById('navLinks').classList.toggle('open');
    document.body.style.overflow = document.getElementById('navLinks').classList.contains('open')?'hidden':'auto';
}
function closeMenu() {
    document.getElementById('hamburger').classList.remove('open');
    document.getElementById('navLinks').classList.remove('open');
    document.body.style.overflow = 'auto';
}
function scrollToTop() { window.scrollTo({top:0,behavior:'smooth'}); }

const cursor = document.querySelector('.custom-cursor');
if (cursor) {
    document.addEventListener('mousemove', e => { cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px'; });
    document.querySelectorAll('a,button,.product-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}
window.addEventListener('scroll', () => {
    const h=document.querySelector('header'); const s=document.querySelector('.scroll-top'); const p=document.querySelector('.parallax-bg');
    if(h) h.classList.toggle('scrolled', window.scrollY>80);
    if(s) s.classList.toggle('visible', window.scrollY>200);
    if(p) p.style.transform=`translateY(${window.pageYOffset*0.4}px)`;
});
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); const t=document.querySelector(a.getAttribute('href')); if(t) t.scrollIntoView({behavior:'smooth',block:'start'}); });
});
document.addEventListener('keydown', e => { if(e.key==='Escape'){closeProductModal();closeCheckout();} });
document.getElementById('productModal').addEventListener('click', function(e){if(e.target===this)closeProductModal();});
document.getElementById('checkoutOverlay').addEventListener('click', function(e){if(e.target===this)closeCheckout();});

// ★ INICIALIZAR
window.addEventListener('DOMContentLoaded', () => { updateProductCards(); });
