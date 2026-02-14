       // ══════════════════════════════════════════
        //  ★ CAMBIA SOLO ESTE NÚMERO ★
        // ══════════════════════════════════════════
        const WHATSAPP_NUMBER = '573132614474'; // Reemplaza con tu número de WhatsApp en formato internacional (sin signos ni espacios)
        // ══════════════════════════════════════════

        const products = {
            black: {
                name: 'Sand K1KO Black', price: 89900,
                image: 'img/black.jpeg',
                itemNumber: 'Item: 92613',
                description: 'Camiseta oversized premium con diseño gráfico exclusivo. Fabricada en 100% algodón premium. El modelo mide 1.83m y usa talla M.'
            },
            white: {
                name: 'Sand K1KO White', price: 89900,
                image: 'img/white.jpeg',
                itemNumber: 'Item: 92614',
                description: 'Camiseta oversized en blanco puro con estampado de alto contraste. Fabricada en 100% algodón premium. El modelo mide 1.83m y usa talla M.'
            }
        };

        let currentProduct = null;
        let cart = [];
        let currentStep = 1;
        let selectedPayMethod = 'debito';

        // ══════════════════════════════════════════
        //  CHECKOUT — abrir / cerrar
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

        // Llenar resumen derecho
        function fillSummary() {
            const total = cart.reduce((s,i) => s+i.price, 0);
            document.getElementById('co-item-count').textContent = cart.length + ' producto' + (cart.length > 1 ? 's' : '');
            document.getElementById('co-subtotal').textContent   = '$' + total.toLocaleString('es-CO');
            document.getElementById('co-total-final').textContent= '$' + total.toLocaleString('es-CO');
            document.getElementById('co-summary-items').innerHTML = cart.map(item => `
                <div class="co-summary-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="co-summary-item-info">
                        <div class="co-summary-item-name">${item.name}</div>
                        <div class="co-summary-item-size">Talla: ${item.size}</div>
                    </div>
                    <div class="co-summary-item-price">$${item.price.toLocaleString('es-CO')}</div>
                </div>`).join('');
        }

        // ── Navegar entre pasos ──────────────────
        function goStep(step, force) {
            if (!force && step > currentStep) {
                // Validar el paso actual antes de avanzar
                if (!validateStep(currentStep)) return;
            }
            currentStep = step;

            // Panels
            document.querySelectorAll('.co-panel').forEach((p,i) => p.classList.toggle('active', i+1 === step));

            // Dots
            document.querySelectorAll('.co-step').forEach((d,i) => {
                d.classList.remove('active','done');
                if (i+1 === step) d.classList.add('active');
                else if (i+1 < step) d.classList.add('done');
            });

            // Lines
            document.querySelectorAll('.co-step-line').forEach((l,i) => {
                l.classList.toggle('done', i+1 < step);
            });

            // Scroll al top del modal
            document.getElementById('checkoutModal').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // ── Validaciones ────────────────────────
        function validateStep(step) {
            let ok = true;
            function check(id, errId, msg) {
                const el = document.getElementById(id);
                const val = el.value.trim();
                if (!val) {
                    el.classList.add('invalid');
                    document.getElementById(errId).textContent = msg || 'Este campo es obligatorio.';
                    ok = false;
                } else {
                    el.classList.remove('invalid');
                    document.getElementById(errId).textContent = '';
                }
                return !!val;
            }

            if (step === 1) {
                const emailOk = check('co-email', 'err-email', 'Ingresa tu correo.');
                if (emailOk) {
                    const emailVal = document.getElementById('co-email').value.trim();
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                        document.getElementById('co-email').classList.add('invalid');
                        document.getElementById('err-email').textContent = 'Correo inválido.';
                        ok = false;
                    }
                }
                check('co-nombre', 'err-nombre');
                check('co-apellido', 'err-apellido');
                const celOk = check('co-celular', 'err-celular', 'Ingresa tu celular.');
                if (celOk) {
                    const cel = document.getElementById('co-celular').value.trim();
                    if (!/^\d{10}$/.test(cel)) {
                        document.getElementById('co-celular').classList.add('invalid');
                        document.getElementById('err-celular').textContent = 'Debe tener 10 dígitos.';
                        ok = false;
                    }
                }
                check('co-tipoDoc',      'err-tipoDoc',      'Selecciona tipo de documento.');
                check('co-numDoc',       'err-numDoc',       'Ingresa tu número de documento.');
                check('co-tipoFactura',  'err-tipoFactura',  'Selecciona tipo de factura.');
            }

            if (step === 2) {
                check('co-municipio', 'err-municipio', 'Ingresa tu barrio.');
                check('co-direccion', 'err-direccion', 'Ingresa tu dirección.');
                check('co-recibe',    'err-recibe',    'Ingresa el nombre de quien recibe.');
            }

            if (step === 3 && selectedPayMethod === 'credito') {
                check('co-cardNum',  'err-cardNum',  'Ingresa el número de tarjeta.');
                check('co-cardName', 'err-cardName', 'Ingresa el nombre en la tarjeta.');
                check('co-cardExp',  'err-cardExp',  'Ingresa la fecha de vencimiento.');
                check('co-cardCvv',  'err-cardCvv',  'Ingresa el CVV.');
            }
            if (step === 3 && (selectedPayMethod === 'nequi' || selectedPayMethod === 'daviplata' || selectedPayMethod === 'bancolombia')) {
                check('co-referencia', 'err-referencia', 'Ingresa el número de referencia o comprobante.');
            }
            if (step === 3 && !selectedPayMethod) {
                ok = false;
            }

            return ok;
        }

        // ── Seleccionar método de pago ──────────
        function selectPay(label, method) {
            selectedPayMethod = method;
            document.querySelectorAll('.co-pay-opt').forEach(l => l.classList.remove('selected'));
            label.classList.add('selected');

            const cardFields = document.getElementById('cardFields');
            const refFields  = document.getElementById('refFields');
            const refBanner  = document.getElementById('refBanner');
            const altInfo    = document.getElementById('altInfo');
            const altText    = document.getElementById('altInfoText');

            // Reset all
            cardFields.style.display = 'none';
            refFields.style.display  = 'none';
            altInfo.style.display    = 'none';
            refBanner.className      = 'co-ref-banner';
            refBanner.innerHTML      = '';

            if (method === 'credito') {
                cardFields.style.display = 'block';

            } else if (method === 'nequi') {
                refFields.style.display = 'block';
                refBanner.classList.add('nequi');
                refBanner.innerHTML = `<span>📱</span><span>Transfiere al número <strong>3XX XXX XXXX</strong> por Nequi y pega aquí el número de comprobante.</span>`;

            } else if (method === 'daviplata') {
                refFields.style.display = 'block';
                refBanner.classList.add('daviplata');
                refBanner.innerHTML = `<span>📱</span><span>Transfiere al número <strong>3XX XXX XXXX</strong> por Daviplata y pega aquí el número de comprobante.</span>`;

            } else if (method === 'bancolombia') {
                refFields.style.display = 'block';
                refBanner.classList.add('bancolombia');
                refBanner.innerHTML = `<span>🏦</span><span>Transfiere a la cuenta <strong>XXX-XXXXXXXX</strong> Bancolombia y pega aquí el número de referencia.</span>`;

            } else if (method === 'contraentrega') {
                altInfo.style.display = 'block';
                altText.textContent   = 'Pagas en efectivo al recibir tu pedido. El domiciliario te visitará en 1 día hábil. Sin costo adicional.';
            }
        }

        // ══════════════════════════════════════════
        //  CONFIRMAR PEDIDO → WHATSAPP CON FACTURA
        // ══════════════════════════════════════════
        function confirmOrder() {
            if (!validateStep(3)) return;

            const nombre   = document.getElementById('co-nombre').value.trim();
            const apellido = document.getElementById('co-apellido').value.trim();
            const email    = document.getElementById('co-email').value.trim();
            const celular  = document.getElementById('co-celular').value.trim();
            const tipoDoc  = document.getElementById('co-tipoDoc').value;
            const numDoc   = document.getElementById('co-numDoc').value.trim();
            const tipoFact = document.getElementById('co-tipoFactura').value === 'empresa' ? 'Empresa / NIT' : 'Persona Natural';
            const depto    = 'Valle del Cauca';
            const munic    = document.getElementById('co-municipio').value.trim();
            const dir      = document.getElementById('co-direccion').value.trim();
            const adicional= document.getElementById('co-adicional').value.trim();
            const recibe   = document.getElementById('co-recibe').value.trim();
            const metPago  = { nequi:'Nequi', daviplata:'Daviplata', bancolombia:'Bancolombia', contraentrega:'Contraentrega', credito:'Tarjeta de Crédito' }[selectedPayMethod] || selectedPayMethod;
            const referencia = (selectedPayMethod === 'nequi' || selectedPayMethod === 'daviplata' || selectedPayMethod === 'bancolombia')
                ? document.getElementById('co-referencia').value.trim() : null;
            const total    = cart.reduce((s,i) => s+i.price, 0);
            const fechaPedido = new Date().toLocaleString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
            const orderNum = 'KK-' + Date.now().toString().slice(-6);

            let msg = '';
            msg += `🧾 *FACTURA K1KO STREETWEAR*\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            msg += `📋 *Pedido:* ${orderNum}\n`;
            msg += `📅 *Fecha:* ${fechaPedido}\n\n`;

            msg += `👤 *DATOS DEL CLIENTE*\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            msg += `• Nombre: ${nombre} ${apellido}\n`;
            msg += `• Celular: ${celular}\n`;
            msg += `• Email: ${email}\n`;
            msg += `• ${tipoDoc}: ${numDoc}\n`;
            msg += `• Facturar como: ${tipoFact}\n\n`;

            msg += `📦 *PRODUCTOS*\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            cart.forEach((item, idx) => {
                msg += `\n${idx + 1}. *${item.name}*\n`;
                msg += `   Talla: ${item.size}\n`;
                msg += `   Precio: $${item.price.toLocaleString('es-CO')} COP\n`;
            });

            msg += `\n🚚 *ENVÍO*\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            msg += `• Ciudad: Buenaventura, ${depto}\n`;
            msg += `• Barrio: ${munic}\n`;
            msg += `• Dirección: ${dir}\n`;
            if (adicional) msg += `• Adicional: ${adicional}\n`;
            msg += `• Recibe: ${recibe}\n`;
            msg += `• Método: Envío Estándar (Gratis)\n\n`;

            msg += `💳 *PAGO*\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            msg += `• Método: ${metPago}\n`;
            if (referencia) msg += `• Referencia/Comprobante: ${referencia}\n`;
            msg += `\n`;

            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            msg += `💰 *TOTAL A PAGAR: $${total.toLocaleString('es-CO')} COP*\n`;
            msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            msg += `✅ _Pedido confirmado. Pronto nos comunicamos contigo._ 🔥\n`;
            msg += `_K1KO Streetwear · Colombia_`;

            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
            closeCheckout();
        }

        // ── MODAL ────────────────────────────────
        function openProductModal(key) {
            const p = products[key]; currentProduct = p;
            document.getElementById('modalTitle').textContent       = p.name;
            document.getElementById('modalPrice').textContent       = `$${p.price.toLocaleString('es-CO')} COP`;
            document.getElementById('modalMainImage').src           = p.image;
            document.getElementById('modalItemNumber').textContent  = p.itemNumber;
            document.getElementById('modalDescription').textContent = p.description;
            document.querySelectorAll('.modal-size-btn').forEach((b,i) => b.classList.toggle('selected', i===1));
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
        function addToCartFromModal() {
            if (!currentProduct) return;
            cart.push({ id: Date.now(), name: currentProduct.name, price: currentProduct.price, size: document.querySelector('.modal-size-btn.selected').textContent, image: currentProduct.image });
            updateCart(); closeProductModal(); setTimeout(toggleCart, 300);
        }

        // ── CARRITO ──────────────────────────────
        function toggleCart() { document.getElementById('cartSidebar').classList.toggle('active'); }
        function removeFromCart(id) { cart = cart.filter(i => i.id !== id); updateCart(); }
        function updateCart() {
            const items  = document.getElementById('cartItems');
            const footer = document.getElementById('cartFooter');
            document.querySelector('.cart-count').textContent = cart.length;
            if (cart.length === 0) {
                items.innerHTML = `<div class="cart-empty"><i class="bi bi-bag-x"></i><p>Tu carrito está vacío</p></div>`;
                footer.style.display = 'none';
            } else {
                items.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-size">Talla: <strong>${item.size}</strong></div>
                            <div class="cart-item-price">$${item.price.toLocaleString('es-CO')} COP</div>
                        </div>
                        <i class="bi bi-trash remove-item" onclick="removeFromCart(${item.id})"></i>
                    </div>`).join('');
                document.getElementById('cartTotal').textContent = `$${cart.reduce((s,i)=>s+i.price,0).toLocaleString('es-CO')} COP`;
                footer.style.display = 'block';
            }
        }

        // ── MENÚ HAMBURGUESA ────────────────────
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

        // ── CURSOR ──────────────────────────────
        const cursor = document.querySelector('.custom-cursor');
        if (cursor) {
            document.addEventListener('mousemove', e => { cursor.style.left = e.clientX+'px'; cursor.style.top = e.clientY+'px'; });
            document.querySelectorAll('a, button, .product-card').forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
            });
        }

        // ── SCROLL ──────────────────────────────
        window.addEventListener('scroll', () => {
            document.querySelector('header').classList.toggle('scrolled', window.scrollY > 80);
            document.querySelector('.scroll-top').classList.toggle('visible', window.scrollY > 200);
            document.querySelector('.parallax-bg').style.transform = `translateY(${window.pageYOffset * 0.4}px)`;
        });
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => { e.preventDefault(); const t = document.querySelector(a.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        });
        function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

        // Cerrar modales con ESC o clic fuera
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeProductModal();
                closeCheckout();
            }
        });
        document.getElementById('productModal').addEventListener('click', function(e) { if (e.target === this) closeProductModal(); });
        document.getElementById('checkoutOverlay').addEventListener('click', function(e) { if (e.target === this) closeCheckout(); });