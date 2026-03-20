// ========== CART PAGE FUNCTIONALITY ==========
class CartPageManager {
    constructor() {
        this.cart = cart;
        this.init();
    }

    init() {
        this.renderCart();
        this.setupEventListeners();
        this.loadRecentlyViewed();
    }

    renderCart() {
        const cartContainer = document.getElementById('cart-items');
        
        if (this.cart.cart.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added anything to your cart yet</p>
                    <a href="shop.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            
            // Hide summary when cart is empty
            const summary = document.querySelector('.cart-summary');
            if (summary) summary.style.display = 'none';
            
            return;
        }

        // Show summary
        const summary = document.querySelector('.cart-summary');
        if (summary) summary.style.display = 'block';

        // Render cart items
        cartContainer.innerHTML = this.cart.cart.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-product">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="product-category">Electronics</div>
                    </div>
                </div>
                
                <div class="cart-item-price">
                    $${item.price.toFixed(2)}
                </div>
                
                <div class="cart-item-quantity">
                    <button class="cart-qty-btn" onclick="cartPage.updateQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button class="cart-qty-btn" onclick="cartPage.updateQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="cart-item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <button class="remove-item" onclick="cartPage.removeItem(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Update summary
        this.updateSummary();
    }

    updateSummary() {
        const summaryContainer = document.getElementById('cart-summary');
        
        // Calculate totals
        const subtotal = this.cart.cart.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        const shipping = subtotal > 50 ? 0 : 5.99;
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + shipping + tax;

        summaryContainer.innerHTML = `
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Tax (10%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(productId);
        } else {
            this.cart.updateQuantity(productId, newQuantity);
            this.renderCart();
            this.cart.updateCartCount();
        }
    }

    removeItem(productId) {
        this.cart.removeItem(productId);
        this.renderCart();
        this.cart.updateCartCount();
    }

    setupEventListeners() {
        // Clear cart button
        const clearBtn = document.getElementById('clearCartBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear your cart?')) {
                    this.cart.clearCart();
                    this.renderCart();
                    this.cart.updateCartCount();
                }
            });
        }

        // Apply coupon button
        const applyBtn = document.getElementById('applyCoupon');
        const couponInput = document.getElementById('couponCode');
        
        if (applyBtn && couponInput) {
            applyBtn.addEventListener('click', () => {
                const code = couponInput.value.trim().toUpperCase();
                
                // Demo coupons
                const coupons = {
                    'SAVE10': 10,
                    'SAVE20': 20,
                    'WELCOME15': 15
                };
                
                if (coupons[code]) {
                    showNotification(`Coupon applied! You saved ${coupons[code]}%`, 'success');
                    couponInput.value = '';
                } else {
                    showNotification('Invalid coupon code', 'error');
                }
            });
        }
    }

    loadRecentlyViewed() {
        // Get recently viewed from localStorage
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        const grid = document.getElementById('recentlyViewedGrid');
        
        if (recentlyViewed.length === 0) {
            grid.innerHTML = '<p style="color: var(--gray-text);">No recently viewed items</p>';
            return;
        }

        // Get product details for recently viewed
        const products = [];
        for (let id of recentlyViewed.slice(0, 4)) {
            for (let category in productsData) {
                const product = productsData[category].find(p => p.id === id);
                if (product) {
                    products.push(product);
                    break;
                }
            }
        }

        grid.innerHTML = products.map(product => {
            const price = product.salePrice || product.price;
            return `
                <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">$${price.toFixed(2)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Initialize cart page
const cartPage = new CartPageManager();

// Helper function for notifications
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}