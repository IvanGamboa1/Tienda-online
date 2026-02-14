        // Custom Cursor
        const cursor = document.querySelector('.custom-cursor');
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.querySelectorAll('a, button, .product-card, .size-option').forEach(elem => {
            elem.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            elem.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });

        // Header Scroll Effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            const scrollTop = document.querySelector('.scroll-top');
            
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
                scrollTop.classList.add('visible');
            } else {
                header.classList.remove('scrolled');
                scrollTop.classList.remove('visible');
            }
        });

        // Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Scroll to Top
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Size Selection
        function selectSize(element) {
            const sizes = element.parentElement.querySelectorAll('.size-option');
            sizes.forEach(size => size.classList.remove('selected'));
            element.classList.add('selected');
        }

        // Shopping Cart Functionality
        let cart = [];

        function toggleCart() {
            const cartSidebar = document.getElementById('cartSidebar');
            cartSidebar.classList.toggle('active');
        }

        function addToCart(name, price, image) {
            const size = document.querySelector('.size-option.selected')?.textContent || 'L';
            
            const item = {
                id: Date.now(),
                name: name,
                price: price,
                size: size,
                image: image,
                quantity: 1
            };

            cart.push(item);
            updateCart();
            toggleCart();
            
            // Animation feedback
            const cartCount = document.querySelector('.cart-count');
            cartCount.style.transform = 'scale(1.5)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 300);
        }

        function removeFromCart(id) {
            cart = cart.filter(item => item.id !== id);
            updateCart();
        }

        function updateCart() {
            const cartItems = document.getElementById('cartItems');
            const cartFooter = document.getElementById('cartFooter');
            const cartCount = document.querySelector('.cart-count');
            const cartTotal = document.getElementById('cartTotal');

            cartCount.textContent = cart.length;

            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="cart-empty">
                        <i class="bi bi-bag-x"></i>
                        <p>Tu carrito está vacío</p>
                    </div>
                `;
                cartFooter.style.display = 'none';
            } else {
                cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div>Talla: ${item.size}</div>
                            <div class="cart-item-price">$${item.price.toLocaleString('es-CO')} COP</div>
                        </div>
                        <i class="bi bi-trash remove-item" onclick="removeFromCart(${item.id})"></i>
                    </div>
                `).join('');

                const total = cart.reduce((sum, item) => sum + item.price, 0);
                cartTotal.textContent = `$${total.toLocaleString('es-CO')} COP`;
                cartFooter.style.display = 'block';
            }
        }

        function checkout() {
            if (cart.length === 0) return;
            
            // Aquí puedes redirigir a tu página de checkout o integrar con una pasarela de pago
            alert('¡Gracias por tu compra! Serás redirigido al proceso de pago.');
            // window.location.href = '/checkout'; // Ejemplo de redirección
        }

        // Parallax Effect
        window.addEventListener('scroll', () => {
            const parallaxBg = document.querySelector('.parallax-bg');
            const scrolled = window.pageYOffset;
            parallaxBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        });

        // Intersection Observer for Animations
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 1s ease-out forwards';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.product-card, .stat-item').forEach(elem => {
            observer.observe(elem);
        });
        const WHATSAPP_NUMBER = '573132614474'; // código país + número sin +

        function checkout() {
            if (cart.length === 0) return;

        const total = cart.reduce((sum, item) => sum + item.price, 0);

        let mensaje = ' *NUEVO PEDIDO K1KO*\n';
        mensaje += '━━━━━━━━━━━━━━━━━━━━\n\n';
        mensaje += ' *Productos:*\n';

        cart.forEach((item, index) => {
            mensaje += `\n${index + 1}. *${item.name}*\n`;
            mensaje += `   • Talla: ${item.size}\n`;
            mensaje += `   • Precio: $${item.price.toLocaleString('es-CO')} COP\n`;
        });

        mensaje += '\n━━━━━━━━━━━━━━━━━━━━\n';
        mensaje += ` *TOTAL: $${total.toLocaleString('es-CO')} COP*\n`;
        mensaje += '━━━━━━━━━━━━━━━━━━━━\n\n';
        mensaje += '_Quiero confirmar este pedido, ¡gracias! ';

        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
        }
        