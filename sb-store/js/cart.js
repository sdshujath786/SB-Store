// ========== AFFILIATE CART SYSTEM (NO PAYMENT) ==========
class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
        this.updateCartCount();
        this.init();
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('sbstore_cart');
        return savedCart ? JSON.parse(savedCart) : { items: [] };
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('sbstore_cart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.updateCartDisplay();
    }

    // Initialize
    init() {
        this.setupEventListeners();
    }

    // Add item to cart
    addItem(product, quantity = 1) {
        if (!product || !product.id) {
            console.error('Invalid product:', product);
            this.showNotification('Error adding to cart', 'error');
            return;
        }

        const existingItem = this.cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.items.push({
                id: product.id,
                name: product.name || 'Product',
                price: product.salePrice || product.price || 0,
                image: product.image || 'https://via.placeholder.com/300',
                quantity: quantity,
                amazonUrl: product.amazonUrl || '#'
            });
        }
        
        this.saveCart();
        this.showNotification(`${product.name || 'Product'} added to cart!`, 'success');
        this.animateCartIcon();
    }

    // Remove item from cart
    removeItem(productId) {
        const item = this.cart.items.find(item => item.id === productId);
        this.cart.items = this.cart.items.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification(`${item?.name || 'Item'} removed from cart`, 'info');
    }

    // Update quantity
    updateQuantity(productId, newQuantity) {
        const item = this.cart.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
            }
        }
    }

    // Get cart items count
    getItemCount() {
        return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Update cart count badge
    updateCartCount() {
        const count = this.getItemCount();
        const badges = document.querySelectorAll('.cart-count, .cart-badge');
        
        badges.forEach(badge => {
            badge.textContent = count;
            if (badge) {
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    }

    // Animate cart icon
    animateCartIcon() {
        const cartIcon = document.querySelector('.cart-icon, .header-icon[href*="cart"], .action-link[href*="cart"]');
        if (cartIcon) {
            cartIcon.classList.add('cart-bounce');
            setTimeout(() => {
                cartIcon.classList.remove('cart-bounce');
            }, 500);
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        let container = document.querySelector('.notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }

    // Update cart display on cart page
    updateCartDisplay() {
        const cartContainer = document.getElementById('cart-items');
        if (!cartContainer) return;

        if (!this.cart.items || this.cart.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added anything yet</p>
                    <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        let html = '';
        let allAmazonUrls = [];
        
        this.cart.items.forEach(item => {
            if (item.amazonUrl) allAmazonUrls.push(item.amazonUrl);
            
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-product">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300'">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                        </div>
                    </div>
                    
                    <div class="cart-item-price">
                        $${item.price.toFixed(2)}
                    </div>
                    
                    <div class="cart-item-quantity">
                        <button class="cart-qty-btn minus" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button class="cart-qty-btn plus" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div class="cart-item-total">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                    
                    <button class="remove-item" onclick="cart.removeItem(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        cartContainer.innerHTML = html;
        
        // Update summary - NO PAYMENT INFO
        const summaryContainer = document.getElementById('cart-summary');
        if (summaryContainer) {
            const subtotal = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            summaryContainer.innerHTML = `
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
            `;
        }
        
        // Update Amazon button with first item's URL or general Amazon link
        const amazonBtn = document.getElementById('amazon-checkout-btn');
        if (amazonBtn) {
            if (allAmazonUrls.length > 0) {
                amazonBtn.href = allAmazonUrls[0];
            } else {
                amazonBtn.href = 'https://www.amazon.com';
            }
        }
    }

    // Setup event listeners
    setupEventListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'sbstore_cart') {
                const newCart = JSON.parse(e.newValue);
                if (newCart) {
                    this.cart = newCart;
                    this.updateCartCount();
                    this.updateCartDisplay();
                }
            }
        });
    }

    // Clear cart
    clearCart() {
        if (this.cart.items.length > 0) {
            this.cart.items = [];
            this.saveCart();
            this.showNotification('Cart cleared', 'info');
        }
    }

    // Debug function
    debugCart() {
        console.log('Current cart:', this.cart);
        console.log('Cart items:', this.cart.items);
        console.log('Item count:', this.getItemCount());
        return this.cart;
    }
}

// Initialize cart
const cart = new ShoppingCart();
window.cart = cart;
window.debugCart = function() { return cart.debugCart(); };

// Add CSS
const style = document.createElement('style');
style.textContent = `
    .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
    }
    
    .cart-notification {
        background: white;
        color: #333;
        padding: 15px 25px;
        border-radius: 10px;
        margin-bottom: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s ease;
        border-left: 4px solid #667eea;
    }
    
    .cart-notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .cart-notification.success {
        border-left-color: #10b981;
    }
    
    .cart-notification.success i {
        color: #10b981;
    }
    
    .cart-notification.info {
        border-left-color: #3b82f6;
    }
    
    .cart-notification.info i {
        color: #3b82f6;
    }
    
    .cart-notification.error {
        border-left-color: #ef4444;
    }
    
    .cart-notification.error i {
        color: #ef4444;
    }
    
    @keyframes cartBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    
    .cart-bounce {
        animation: cartBounce 0.5s ease;
    }
`;
document.head.appendChild(style);